import ApiResponse from "../utilities/apiResponse.js";
import { getDashboardData } from "../services/dashboardServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const data = await getDashboardData({ userId });
  return res.status(200).json(new ApiResponse(200, data, "success"));
});