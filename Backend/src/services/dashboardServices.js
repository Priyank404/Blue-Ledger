import { cacheGet, cacheSet } from "../configs/redis.js";
import { Transaction } from "../models/transactionSchema.js";
import { calculatePortfolioAnalytics } from "./portfolioAnalyticService.js";
import { getPortfolioHistory } from "./portfolioSnapShotServices.js";
import { Portfolio } from "../models/portfolioSchema.js";
import logger from "../utilities/logger.js";

export const getDashboardData = async ({userId}) =>{
    try {

        const portfolio = await Portfolio.findOne({user: userId});

        if (!portfolio) {
        return {
            totalValue: 0,
            totalProfit: 0,
            portfolioHistory: [],
            recentTransaction: []
        };
        }
        const cachedKey = `dashboard:v2:${userId}`
        
        const cachedData = await cacheGet(cachedKey);

        if(cachedData){
            logger.info("Dashboard cached HIT");
            return cachedData;
        }

        logger.info("Dashboard cached MISS");

        const analytics = await calculatePortfolioAnalytics({userId});
        const portfolioHistory = await getPortfolioHistory({userId});

        const allTransaction = await Transaction.find({Portfolio: portfolio._id}).sort({date:-1}).lean();
        const recentTransaction = allTransaction.sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,15).map((txn) => ({
            date: txn.date,
            symbol: txn.symbol,
            type: txn.transactionType,
            qty: txn.quantity,
            price: txn.pricePerUnit,
            totalAmt: txn.quantity * txn.pricePerUnit
        }));

        const dashboardData = {
            ...analytics,
            portfolioHistory,
            recentTransaction
        };

        await cacheSet(cachedKey, dashboardData, 30);
        

        return dashboardData;

    } catch (error) {
        logger.error("Error while calculating portfolio analytics", {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        throw error;
    }
}

export const getPortfolioPageData = async ({userId}) =>{
    try {
        const cachedKey = `portfolio:v2:${userId}:page`;

        const cachedData = await cacheGet(cachedKey);

        if(cachedData){
            logger.info("Portfolio page cached HIT");
            return cachedData;
        }

        logger.info("Portfolio page cached MISS");


        const analytics = await calculatePortfolioAnalytics({userId});
         const portfolioHistory = await getPortfolioHistory({userId});

         const portfolioData = {
            ...analytics,
            portfolioHistory
         };

         await cacheSet(cachedKey, portfolioData, 30);

         return portfolioData;
    } catch (error) {
        logger.info("Error while fetching portfolio page data", {error});
        throw error;
    }
}
