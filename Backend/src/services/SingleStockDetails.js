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
 * Uses Redis caching (5 minutes TTL)
 */
export const getStockDetailsService = async ({ userId, id  }) => {
  const cacheKey = `stock:${userId}:${id}`;

  try {
    // Check cache
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info("Stock details cache HIT", { userId, id  });
      return cached;
    }

    logger.info("Stock details cache MISS", { userId, id  });

    // 1. Get user's portfolio
    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      throw new ApiError(404, "Portfolio not found");
    }

    // 2. Get holding by symbol
    const holding = await Holdings.findOne({
      Portfolio: portfolio._id,
      _id: new mongoose.Types.ObjectId(id)
    });

    if (!holding) {
      throw new ApiError(404, `Holding not found or not owned by you`);
    }

    // 3. Get live price (cached)
    const livePriceData = await getSingleLivePriceCached(holding.symbol);
    const currentPrice = livePriceData[0]?.price || 0;

    // 4. Calculate stock metrics
    const qty = Number(holding.Quantity);
    const avgPrice = Number(holding.avgBuyPrice);
    const totalInvest = avgPrice * qty;
    const currentValue = currentPrice * qty;
    const pnl = currentValue - totalInvest;
    const pnlPercentage = totalInvest > 0 ? Number(((pnl / totalInvest) * 100).toFixed(2)) : "0.00";
    const roi = totalInvest > 0 ? Number(((pnl / totalInvest) * 100).toFixed(2)) : "0.00";

    // 5. Get price history (from snapshots)
    const priceHistory = await getStockHistory({ symbol: holding.symbol });
    console.log(priceHistory)

    const priceComparisonData = priceHistory.map((h) => ({
      date: h.day,
      currentPrice: Number(h.price),
      avgBuyPrice: avgPrice
    }));

    const valueOverTime = priceHistory.map((h) => ({
      date: h.day,
      value: Number(h.price) * qty,
      avgBuyValue: avgPrice * qty
    }));

    const pnlOverTime = priceHistory.map((h) => {
    const currentValueAtThatDay = Number(h.price) * qty;
    const pnlDay = currentValueAtThatDay - totalInvest;

    const pnlPercent =
      totalInvest > 0 ? Number(((pnlDay / totalInvest) * 100).toFixed(2)) : 0;

    return {
      date: h.day,
      pnl: Number(pnlDay.toFixed(2)),
      pnlPercent
    };
  });

    // 6. Get transactions for this stock
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

    // 7. Compile complete stock data
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
      priceHistory,
      transactions: formattedTransactions,
      priceComparisonData,
      valueOverTime,
      pnlOverTime,
      livePrice: livePriceData,
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, stockData, 300);

    return stockData;
  } catch (error) {
    logger.error("Error fetching stock details", { error });
    throw error;
  }
};