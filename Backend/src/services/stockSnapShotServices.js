import logger from "../utilities/logger.js";
import { Holdings } from "../models/holdingSchema.js";
import { StockPriceSnapshot } from "../models/stockSnapShot.js";
import { BulkPrice } from "./stockDataServices.js";

export const createStockSnapshots = async () => {
  try {
    // 1️⃣ Get DISTINCT symbols from all holdings
    const holdings = await Holdings.find({}, { symbol: 1, _id: 0 });

    if (!holdings.length) {
      logger.info("No holdings found, skipping stock snapshots");
      return;
    }

    const symbols = [...new Set(holdings.map(h => h.symbol))];

    // 2️⃣ Fetch live prices (bulk)
    const prices = await BulkPrice({ symbols });

    // 3️⃣ Save snapshot PER STOCK
    const today = new Date();

    const snapshots = prices.map(p => ({
      symbol: p.symbol,
      date: today,
      price: p.lastPrice
    }));

    await StockPriceSnapshot.insertMany(snapshots);

    logger.info("Stock price snapshots created", {
      count: snapshots.length
    });
  } catch (error) {
    logger.error("Failed to create stock snapshots", { error });
  }
};

export const getStockHistory = async ({ symbol }) => {
  if (!symbol) return [];

  const snapshots = await StockPriceSnapshot.find(
    { symbol },
    { date: 1, price: 1, _id: 0 }
  ).sort({ date: 1 });

  return snapshots;
};

