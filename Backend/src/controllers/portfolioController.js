import ApiResponse from "../utilities/apiResponse.js";
import { getPortfolioHistory } from "../services/portfolioSnapShotServices.js";
import { getPortfolioPageData } from "../services/dashboardServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const getPortfolioValueHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const history = await getPortfolioHistory({ userId });

  return res.status(200).json(
    new ApiResponse(200, history, "success")
  );
});

export const getPorfolioAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const data = await getPortfolioPageData({ userId });

  return res.status(200).json(new ApiResponse(200, data, "success"));
});
