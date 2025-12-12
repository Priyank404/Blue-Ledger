import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import ApiError from "../utilities/apiError.js";
import { getStockPrice } from "../services/stockDataServices.js";

export const getPrice = async (req, res, next)=>{
    const symbol = req.params.symbol;

    if(!symbol){
        logger.error("error in fecting price as symbole not found")
        ApiError(400,'symbol not found')
    }
    try {
        logger.info("getting price for stock")
        
        const data = await getStockPrice({symbol});

        logger.info("Get Price successful");
        res.status(200).json(
            new ApiResponse(200, data.priceInfo.lastPrice, "success")
        )
    } catch (error) {
        logger.error("error while fetching the price of stock ",{error});
        next(error);
    }
}