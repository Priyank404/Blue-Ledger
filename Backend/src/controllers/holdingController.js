import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import { getHoldings } from "../services/holdingsServices.js";


export const Holdings = async(req, res, next) =>{
    
    const userId = req.user.id;
    try {
        logger.info("Get holdings attemped");

        const result = await getHoldings({userId});

        logger.info("Get holdings successful");
        res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while getting holdings", {error});
        next(error)
    }
}