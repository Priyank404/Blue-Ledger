import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import { getHoldings } from "../services/holdingsServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const Holdings = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  logger.info("Get holdings attempted");

  const result = await getHoldings({ userId });

  logger.info("Get holdings successful");
  return res.status(200).json(
    new ApiResponse(200, result, "success")
  );
});