import logger from "../utilities/logger.js";
import ApiError from "../utilities/apiError.js";
import ApiResponse from "../utilities/apiResponse.js";
import { getDashboardData } from "../services/dashboardServices.js";


export const getDashboard = async(req, res, next) =>{
    try {
        const userId = req.user.id;

        const data = await getDashboardData({userId});

        return res.status(200).json(new ApiResponse(200, data, "success"));
    } catch (error) {
        next(error);
    }
}