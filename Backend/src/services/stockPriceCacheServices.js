import { cacheGet, cacheSet } from "../configs/redis.js";
import { BulkPrice, getStockPrice } from "./stockDataServices.js";
import logger from "../utilities/logger.js";

const summarizeMarketDataError = (error) => ({
    message: error.message,
    name: error.name,
    code: error.code,
    status: error.response?.status || error.status,
    url: error.config?.url,
});

const normalizeSymbols = (input) => {
    const symbols = Array.isArray(input) ? input : input?.symbols;
    return [...new Set((symbols || []).map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean))];
};

const normalizeSymbol = (input) => String(input?.symbol || input || "").trim().toUpperCase();

export const getLivePriceCached = async (input) =>{
    try {
        const symbols = normalizeSymbols(input);
        const cacheKey = `livePrice:v2:${[...symbols].sort().join(",")}`;

        const cachedData = await cacheGet(cacheKey);

        if(cachedData){
            logger.info("Live price cached HIT");
            return cachedData;
        };

        logger.info("Live price cached MISS");

        const price = await BulkPrice({symbols});

        await cacheSet( cacheKey, price, 30);

        return price;
    } catch (error) {
        logger.error("Error while fetching live price", summarizeMarketDataError(error));
        throw error;
    }
}

export const getSingleLivePriceCached = async (input) =>{

    try {
        const symbol = normalizeSymbol(input);
        const cacheKey = `livePrice:v2:${symbol}`;

        const cachedData = await cacheGet(cacheKey);

        if(cachedData){
            logger.info("Live price cached HIT");
            return cachedData;
        };

        logger.info("Live price cached MISS");

        const price = await getStockPrice({symbol});

        await cacheSet( cacheKey, price, 30);

        return price;
    } catch (error) {
        logger.error("Error while fetching live price", summarizeMarketDataError(error));
        throw error;
    }
}
