import logger from "../utilities/logger.js";
import ApiError from "../utilities/apiError.js";
import ApiResponse from "../utilities/apiResponse.js";
import { exportData } from "../services/exportServices.js";
import { toCsv } from "../utilities/toCsv.js";

export const getExport = async (req, res, next) =>{
    try {
        const userId = req.user.id;

        const { type, format } = req.query;

        const allowedTypes = [
            'transactions',
            'holdings',
            'portfolioSummary',
            'portfolioHistory',
            'all'
        ];

        const allowedFormats = ['csv', 'json'];

        if (!allowedTypes.includes(type)) {
        throw new ApiError(400, 'Invalid export type');
        }

        if (!allowedFormats.includes(format)) {
        throw new ApiError(400, 'Invalid export format');
        }

        if (type === "all" && format === "csv") {
            throw new ApiError(400, "CSV export not supported for all data");
        }


        logger.info("Export requested", { userId, type, format });

        const data = await exportData(userId, type);

        if(format === 'json'){
           return res.status(200).json(
            new ApiResponse(200, data, "success")
            )
        }
        
        
    // Map type → correct dataset
        let csvData;

        switch (type) {
        case "transactions":
            csvData = data.transactions;
            break;
        case "holdings":
            csvData = data.holdings;
            break;
        case "portfolioSummary":
            csvData = [data]; // summary is single object
            break;
        case "portfolioHistory":
            csvData = data.portfolioHistory;
            break;
        default:
            throw new Error("Invalid export type");
        }

        const { csv, filename } = toCsv(type, csvData);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
        );

        if (!csvData || csvData.length === 0) {
            throw new ApiError(400, "No data available for export");
        }


        return res.status(200).send(csv);


    } catch (error) {
        logger.error("Error while exporting data", {error});
        next(error)
    }
}