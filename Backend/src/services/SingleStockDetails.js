import { Holdings } from "../models/holdingSchema.js";
import { Transaction } from "../models/transactionSchema.js";
import { Portfolio } from "../models/portfolioSchema.js";
import { getSingleLivePriceCached } from "./stockPriceCacheServices.js";
import { getStockHistory } from "./stockSnapShotServices.js";
import { cacheGet, cacheSet } from "../configs/redis.js";
import logger from "../utilities/logger.js";
import ApiError from "../utilities/apiError.js";
import mongoose from "mongoose";

/**
 * Get complete stock details for individual stock page
 * Includes: holding data, live price, P/L calculations, price history, transactions
 * Uses short Redis caching because it includes live market value.
 */
export const getStockDetailsService = async ({ userId, id }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid stock holding ID format");
  }

  const cacheKey = `stock:v2:${userId}:${id}`;

  // Check cache
  const cached = await cacheGet(cacheKey);
  if (cached) {
    logger.info("Stock details cache HIT", { userId, id });
    return cached;
  }

  logger.info("Stock details cache MISS", { userId, id });

  // 1. Get user's portfolio
  const portfolio = await Portfolio.findOne({ user: userId }).lean();
  if (!portfolio) {
    throw new ApiError(404, "Portfolio not found");
  }

  // 2. Get holding by ID
  const holding = await Holdings.findOne({
    Portfolio: portfolio._id,
    _id: new mongoose.Types.ObjectId(id)
  }).lean();

  if (!holding) {
    throw new ApiError(404, `Holding not found or not owned by you`);
  }

  // 3. Parallelize queries (performance optimization)
  const [priceHistory, livePriceDataResult] = await Promise.allSettled([
    getStockHistory({ symbol: holding.symbol }),
    getSingleLivePriceCached(holding.symbol)
  ]);

  const priceHistoryData = priceHistory.status === "fulfilled" ? priceHistory.value : [];
  
  let livePriceData = [];
  let priceSource = "live";

  if (livePriceDataResult.status === "fulfilled") {
    livePriceData = livePriceDataResult.value;
  } else {
    priceSource = "fallback";
    logger.warn("Live stock detail price unavailable, using buy-price fallback", {
      symbol: holding.symbol,
      message: livePriceDataResult.reason?.message,
    });
  }

  const currentPrice = Number(livePriceData[0]?.price || holding.avgBuyPrice || 0);

  // 4. Calculate stock metrics
  const qty = Number(holding.Quantity);
  const avgPrice = Number(holding.avgBuyPrice);
  const totalInvest = avgPrice * qty;
  const currentValue = currentPrice * qty;
  const pnl = currentValue - totalInvest;
  const pnlPercentage = totalInvest > 0 ? Number(((pnl / totalInvest) * 100).toFixed(2)) : 0;
  const roi = totalInvest > 0 ? Number(((pnl / totalInvest) * 100).toFixed(2)) : 0;

  const priceComparisonData = priceHistoryData.map((h) => ({
    date: h.date,
    currentPrice: Number(h.price),
    avgBuyPrice: avgPrice
  }));

  const valueOverTime = priceHistoryData.map((h) => ({
    date: h.date,
    value: Number(h.price) * qty,
    avgBuyValue: avgPrice * qty
  }));

  const pnlOverTime = priceHistoryData.map((h) => {
    const currentValueAtThatDay = Number(h.price) * qty;
    const pnlDay = currentValueAtThatDay - totalInvest;
    const pnlPercent = totalInvest > 0 ? Number(((pnlDay / totalInvest) * 100).toFixed(2)) : 0;

    return {
      date: h.date,
      pnl: Number(pnlDay.toFixed(2)),
      pnlPercent
    };
  });

  // 5. Get transactions for this stock
  const transactions = await Transaction.find({
    Portfolio: portfolio._id,
    symbol: holding.symbol,
  })
    .sort({ date: -1 })
    .lean();

  const formattedTransactions = transactions.map((t) => ({
    id: t._id,
    date: t.date,
    name: t.symbol,
    qty: t.quantity,
    price: t.pricePerUnit,
    type: t.transactionType,
    totalAmt: Number(t.pricePerUnit) * Number(t.quantity),
  }));

  // 6. Compile complete stock data
  const stockData = {
    id: holding._id,
    symbol: holding.symbol,
    qty,
    avgPrice,
    currentPrice,
    totalInvest,
    currentValue,
    pnl,
    pnlPercentage,
    roi,
    priceSource,
    marketDataStatus: {
      source: priceSource,
      liveAvailable: priceSource === "live",
      updatedAt: new Date().toISOString(),
    },
    priceHistory: priceHistoryData,
    transactions: formattedTransactions,
    priceComparisonData,
    valueOverTime,
    pnlOverTime,
    livePrice: livePriceData,
  };

  // Cache briefly because this response contains live market value.
  await cacheSet(cacheKey, stockData, 30);

  return stockData;
};
