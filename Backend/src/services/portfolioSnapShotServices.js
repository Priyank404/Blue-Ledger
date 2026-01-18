import logger from "../utilities/logger.js";
import { Holdings } from "../models/holdingSchema.js";
import { PortfolioSnapshot } from "../models/portfolioSnapshot.js";
import { Portfolio } from "../models/portfolioSchema.js";
import { BulkPrice } from "./stockDataServices.js"; // your NSE bulk price service

export const createPortfolioSnapshot = async ({ portfolioId }) => {
  try {
    // 1. Get current holdings
    const holdings = await Holdings.find({ Portfolio: portfolioId });

    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = ist.toISOString().slice(0, 10);

    if (!holdings || holdings.length === 0) {
      // Portfolio exists but no holdings → value = 0
      await PortfolioSnapshot.create({
        portfolio: portfolioId,
        day: day,
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
    const roundedValue = Number(totalValue.toFixed(2));

    

    // 5. Save snapshot
    await PortfolioSnapshot.updateOne(
      { portfolio: portfolioId, day },     // filter
      { $set: { value: roundedValue, date: ist } },  // update
      { upsert: true }
    );

    
    logger.info("Portfolio snapshot created", {
      portfolioId,
      value: roundedValue
    });
  } catch (error) {
    // IMPORTANT: snapshot must NEVER break transactions
    logger.error("Failed to create portfolio snapshot", { error });
  }
};

export const getPortfolioHistory = async ({ userId }) => {
  const portfolio = await Portfolio.findOne({ user: userId });

  if (!portfolio) return [];

  console.log("portfolioId:", portfolio._id.toString());

  const count = await PortfolioSnapshot.countDocuments({ portfolio: portfolio._id });
  console.log("snapshots count:", count);

  const snapshots = await PortfolioSnapshot.aggregate([
    { $match: { portfolio: portfolio._id } },
    {
      $project: {
        _id: 0,
        value: 1,
        day: {
          $ifNull: [
            "$day",
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date"
              }
            }
          ]
        }
      }
    },
    { $sort: { day: 1 } }
  ]);

  return snapshots;
};
