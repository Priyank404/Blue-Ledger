import logger from "../utilities/logger.js";
import ApiError from "../utilities/apiError.js";
import ApiResponse from "../utilities/apiResponse.js";
import { exportData } from "../services/exportServices.js";

export const getExport = async (req, res, next) =>{
    try {
        const userId = req.user.id;

        const { type, format } = req.query;



        const allowedTypes = [
            'transactions',
            'holdings',
            'summary',
            'history',
            'all'
        ];

        const allowedFormats = ['csv', 'json'];

        if (!allowedTypes.includes(type)) {
        throw new ApiError(400, 'Invalid export type');
        }

        if (!allowedFormats.includes(format)) {
        throw new ApiError(400, 'Invalid export format');
        }

        logger.info("attemped export data");

        const data = await exportData(userId, type);

        if(format === 'json'){
            res.status(200).json(
            new ApiResponse(200, data, "success")
            )
        }
        
        if(format === 'csv'){
            res.status(200).json(
            new ApiResponse(200, data, "success")
            )
        }


    } catch (error) {
        logger.error("Error while exporting data", {error});
        next(error)
    }
}