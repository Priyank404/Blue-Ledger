import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import ApiError from "../utilities/apiError.js";
import { getStockPrice } from "../services/stockDataServices.js";
import { getStockHistory } from "../services/stockSnapShotServices.js";
import { BulkPrice } from "../services/stockDataServices.js";
import { getLivePriceCached, getSingleLivePriceCached } from "../services/stockPriceCacheServices.js";
import { getStockDetailsService } from "../services/SingleStockDetails.js";

export const getPrice = async (req, res, next)=>{
    const symbol = req.params.symbol;

    if(!symbol){
        logger.error("error in fecting price as symbole not found")
       new ApiError(400,'symbol not found')
    }
    try {
        logger.info("getting price for stock")
        
        const data = await getStockPrice({symbol});

        logger.info("Get Price successful");
        res.status(200).json(
            new ApiResponse(200, data, "success")
        )
    } catch (error) {
        logger.error("error while fetching the price of stock ",{error});
        next(error);
    }
};

export const getPriceBulk = async (req, res, next) =>{
    
    const symbols = req.body;
    if(!symbols){
        logger.error("error in fecting price as symbol not found")
        new ApiError(400, "symbol not found")
    }

    try {
        logger.info("getting price for stocks in bulk")

        const data = await BulkPrice({symbols})

        logger.info("Get Price successful");

        res.status(200).json(
            new ApiResponse(200, data, "success")
        )
    } catch (error) {
        logger.error("error while fetchng the price of stock",{error});
        next(error)
    }
}

export const getStockHistoryController = async(req, res, next) =>{

    const symbol = req.params.symbol;
    try {
        logger.info("getting stock history")

        const data = await getStockHistory({symbol});

        logger.info("Get stock history successful");
        res.status(200).json(
            new ApiResponse(200, data, "success")
        )
    } catch (error) {
        next(error)
    }
}

export const getPriceCached = async (req, res, next) =>{
    const symbol = req.params.symbol;

    if(!symbol){
        logger.error("error in fecting price as symbole not found")
       new ApiError(400,'symbol not found')
    }
    try {
        logger.info("getting cached price for stock")
        
        const data = await getSingleLivePriceCached({symbol});

        logger.info("Get cached Price successful");
        res.status(200).json(
            new ApiResponse(200, data, "success")
        )
    } catch (error) {
        logger.error("error while fetching the cached price of stock ",{error});
        next(error);
    }
}

export const getPriceBulkCached = async (req, res, next) =>{
     const symbols = req.body;
    if(!symbols){
        logger.error("error in fecting price as symbol not found")
        new ApiError(400, "symbol not found")
    }

    try {
        logger.info("getting  cached price for stocks in bulk")

        const data = await getLivePriceCached({symbols})

        logger.info("Get cached Price successful");

        res.status(200).json(
            new ApiResponse(200, data, "success")
        )
    } catch (error) {
        logger.error("error while fetchng the cached price of stock",{error});
        next(error)
    }
}

export const getStockDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id  } = req.params;

    if (!id) {
      throw new ApiError(400, "Stock symbol is required");
    }

    // ✅ Call service (all business logic there)
    const stockData = await getStockDetailsService({ userId, id  });

    return res.status(200).json(
      new ApiResponse(200, stockData, "Stock details fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};