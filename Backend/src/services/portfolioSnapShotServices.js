import logger from "../utilities/logger.js";
import { Holdings } from "../models/holdingSchema.js";
import { PortfolioSnapshot } from "../models/portfolioSnapshot.js";
import { Portfolio } from "../models/portfolioSchema.js";
import { BulkPrice } from "./stockDataServices.js"; // your NSE bulk price service

export const createPortfolioSnapshot = async ({ portfolioId }) => {
  try {
    // 1. Get current holdings
    const holdings = await Holdings.find({ Portfolio: portfolioId });

    if (!holdings || holdings.length === 0) {
      // Portfolio exists but no holdings → value = 0
      await PortfolioSnapshot.create({
        portfolio: portfolioId,
        date: new Date(),
        value: 0
      });
      return;
    }

    // 2. Extract symbols
    const symbols = holdings.map(h => h.symbol);

    // 3. Fetch live prices (bulk)
    const prices = await BulkPrice({ symbols });

    // Convert price array → map
    const priceMap = {};
    prices.forEach(p => {
      priceMap[p.symbol] = p.lastPrice;
    });

    // 4. Calculate portfolio value
    let totalValue = 0;
    for (const h of holdings) {
      const price = priceMap[h.symbol] || 0;
      totalValue += price * h.Quantity;
    }

    // 5. Save snapshot
    await PortfolioSnapshot.create({
      portfolio: portfolioId,
      date: new Date(),
      value: totalValue
    });

    logger.info("Portfolio snapshot created", {
      portfolioId,
      value: totalValue
    });
  } catch (error) {
    // IMPORTANT: snapshot must NEVER break transactions
    logger.error("Failed to create portfolio snapshot", { error });
  }
};

export const getPortfolioHistory = async ({ userId }) => {
  const portfolio = await Portfolio.findOne({ user: userId });

  if (!portfolio) return [];

  const snapshots = await PortfolioSnapshot.find(
    { portfolio: portfolio._id },
    { date: 1, value: 1, _id: 0 }
  ).sort({ date: 1 });

  return snapshots;
};
