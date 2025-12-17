import cron from "node-cron";
import logger from "../utilities/logger.js";
import { Portfolio } from "../models/portfolioSchema.js";
import { createPortfolioSnapshot } from "../services/portfolioSnapShotServices.js";

/**
 * Runs once per day after market close (IST)
 * Creates a portfolio value snapshot for ALL portfolios
 */
export const startPortfolioSnapshotCron = () => {
  // ⏰ 4:00 PM IST (after NSE close)
  cron.schedule(
    "0 16 * * *",
    async () => {
      logger.info("Daily portfolio snapshot cron started");

      try {
        const portfolios = await Portfolio.find({}, { _id: 1 });

        for (const portfolio of portfolios) {
          await createPortfolioSnapshot({
            portfolioId: portfolio._id
          });
        }

        logger.info("Daily portfolio snapshot cron completed");
      } catch (error) {
        logger.error("Daily snapshot cron failed", { error });
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};
