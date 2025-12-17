import ApiResponse from "../utilities/apiResponse.js";
import { getPortfolioHistory } from "../services/portfolioSnapShotServices.js";

export const getPortfolioValueHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = await getPortfolioHistory({ userId });

    return res.status(200).json(
      new ApiResponse(200, history, "success")
    );
  } catch (error) {
    next(error);
  }
};
