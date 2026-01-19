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

    logger.info("Symbols from holdings", symbols);
    logger.info("Symbols returned from BulkPrice", prices.map(p => p.symbol));


    


    // 3️⃣ Save snapshot PER STOCK PER DAY

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshots = prices.map(p => ({
      symbol: p.symbol,
      date: today,
      price: p.lastPrice
    }));
    logger.info("Snapshots ready to insert", snapshots.slice(0, 3));

    const bulkOps = snapshots.map(s => ({
      updateOne: {
        filter: { symbol: s.symbol, date: s.date },
        update: { $set: { price: s.price } },
        upsert: true
      }
    }));

    
    
    const result = await StockPriceSnapshot.bulkWrite(bulkOps);
    logger.info("Bulk write result", result);
    
    for (const sym of symbols) {
      const oldDocs = await StockPriceSnapshot.find({ symbol: sym })
        .sort({ date: -1 })     // newest first
        .skip(10)               // after latest 10
        .select("_id");

      if (oldDocs.length > 0) {
        const idsToDelete = oldDocs.map(d => d._id);
        await StockPriceSnapshot.deleteMany({ _id: { $in: idsToDelete } });

        logger.info("Old snapshots removed", {
          symbol: sym,
          removed: idsToDelete.length
        });
      }
    }

    const count = await StockPriceSnapshot.countDocuments();
    logger.info("Total snapshot docs in DB", { count });


    logger.info("Stock price snapshots created + trimmed", {
      symbolsCount: symbols.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount
    });
  } catch (error) {
    logger.error("Failed to create stock snapshots", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
  }
};

export const getStockHistory = async ({ symbol }) => {
  if (!symbol) return [];

  const snapshots = await StockPriceSnapshot.find(
    { symbol },
    { date: 1, price: 1, _id: 0 }
  ).sort({ date: 1 });
  logger.info(snapshots)

  return snapshots;
};

