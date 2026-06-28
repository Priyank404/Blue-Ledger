import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import ApiError from "../utilities/apiError.js";
import { getStockPrice } from "../services/stockDataServices.js";
import { getStockHistory } from "../services/stockSnapShotServices.js";
import { BulkPrice } from "../services/stockDataServices.js";
import { getLivePriceCached, getSingleLivePriceCached } from "../services/stockPriceCacheServices.js";
import { getStockDetailsService } from "../services/SingleStockDetails.js";
import { resolveNseStock } from "../services/stockDataServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const getPrice = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol;
  if (!symbol) {
    logger.error("Error in fetching price as symbol not found");
    throw new ApiError(400, "symbol not found");
  }

  logger.info("Getting price for stock");
  const data = await getStockPrice({ symbol });

  logger.info("Get Price successful");
  return res.status(200).json(
    new ApiResponse(200, data, "success")
  );
});

export const getPriceBulk = asyncHandler(async (req, res, next) => {
  const symbols = Array.isArray(req.body) ? req.body : req.body?.symbols;
  if (!symbols || !Array.isArray(symbols)) {
    logger.error("Error in fetching price as symbol not found");
    throw new ApiError(400, "symbol not found");
  }

  logger.info("Getting price for stocks in bulk");
  const data = await BulkPrice({ symbols });

  logger.info("Get Price successful");
  return res.status(200).json(
    new ApiResponse(200, data, "success")
  );
});

export const getStockHistoryController = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol;
  logger.info("Getting stock history");

  const data = await getStockHistory({ symbol });

  logger.info("Get stock history successful");
  return res.status(200).json(
    new ApiResponse(200, data, "success")
  );
});

export const getPriceCached = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol;
  if (!symbol) {
    logger.error("Error in fetching price as symbol not found");
    throw new ApiError(400, "symbol not found");
  }

  logger.info("Getting cached price for stock");
  const data = await getSingleLivePriceCached({ symbol });

  logger.info("Get cached Price successful");
  return res.status(200).json(
    new ApiResponse(200, data, "success")
  );
});

export const getPriceBulkCached = asyncHandler(async (req, res, next) => {
  const symbols = Array.isArray(req.body) ? req.body : req.body?.symbols;
  if (!symbols || !Array.isArray(symbols)) {
    logger.error("Error in fetching price as symbol not found");
    throw new ApiError(400, "symbol not found");
  }

  logger.info("Getting cached price for stocks in bulk");
  const data = await getLivePriceCached({ symbols });

  logger.info("Get cached Price successful");
  return res.status(200).json(
    new ApiResponse(200, data, "success")
  );
});

export const getStockDetails = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Stock ID is required");
  }

  const stockData = await getStockDetailsService({ userId, id });

  return res.status(200).json(
    new ApiResponse(200, stockData, "Stock details fetched successfully")
  );
});

export const resolveStock = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  const stock = await resolveNseStock(query);

  return res.status(200).json(
    new ApiResponse(200, stock, "Stock found")
  );
});
