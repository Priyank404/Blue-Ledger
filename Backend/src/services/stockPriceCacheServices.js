import { redisClient } from "../configs/redis.js";
import { BulkPrice, getStockPrice } from "./stockDataServices.js";
import logger from "../utilities/logger.js";

export const getLivePriceCached = async (symbols) =>{
    try {
        const cacheKey = `livePrice:${symbols.sort().join(",")}`;

        const cachedData = await redisClient.get(cacheKey);

        if(cachedData){
            logger.info("Live price cached HIT");
            return cachedData;
        };

        logger.info("Live price cached MISS");

        const price = await BulkPrice({symbols});

        await redisClient.set( cacheKey, price, 60);

        return price;
    } catch (error) {
        logger.error("Error while fetching live price from cache", {error});
        throw error;
    }
}

export const getSingleLivePriceCached = async (symbol) =>{

    try {
        const cacheKey = `livePrice:${symbol}`;

        const cachedData = await redisClient.get(cacheKey);

        if(cachedData){
            logger.info("Live price cached HIT");
            return cachedData;
        };

        logger.info("Live price cached MISS");

        const price = await getStockPrice({symbol});

        await redisClient.set( cacheKey, price, 60);

        return price;
    } catch (error) {
        logger.error("Error while fetching live price from cache", {error});
        throw error;
    }
}