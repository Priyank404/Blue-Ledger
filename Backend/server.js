import "./src/configs/env.js"
import app from './src/app.js';
import logger from './src/utilities/logger.js';
import connectDB from './src/configs/databaseConnection.js';
import { startPortfolioSnapshotCron } from './src/cron/portfolioSnapShotCron.js';


const PORT = process.env.PORT




connectDB().then(()=>{
        try {
            app.listen(PORT,()=>{
                logger.info(`Server running on port ${PORT}`);
            });

        } catch (error) {
            logger.error("Error starting node server", {error})
        }
    }
).catch((error) => {
    logger.error("Error connecting to database", {error});
});


process.on("exit", () => console.log("NODE EXITED"));
process.on("uncaughtException", err => console.log(err));