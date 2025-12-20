import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import ApiError from "../utilities/apiError.js";
import { getStockPrice } from "../services/stockDataServices.js";
import { getStockHistory } from "../services/stockSnapShotServices.js";
import { BulkPrice } from "../services/stockDataServices.js";

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

        const data = getStockHistory({symbol});

        logger.info("Get stock history successful");
        res.status(200).json(
            new ApiResponse(200, data, "success")
        )
    } catch (error) {
        next(error)
    }
}