import cron from "node-cron";
import logger from "../utilities/logger.js";
import { createStockSnapshots } from "../services/stockSnapShotServices.js";

/**
 * Runs once per day after market close (IST)
 * Stores stock price snapshots for all symbols
 */
export const startStockSnapshotCron = () => {
  cron.schedule(
    "0 16 * * 1-5", // 4:00 PM IST
    async () => {
      logger.info("Daily stock price snapshot cron started");

      try {
        await createStockSnapshots();
        logger.info("Daily stock price snapshot cron completed");
      } catch (error) {
        logger.error("Daily stock snapshot cron failed", { error });
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};
