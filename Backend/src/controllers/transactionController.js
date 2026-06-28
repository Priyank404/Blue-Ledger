import logger from '../utilities/logger.js';
import transaction from '../services/transactionServices.js';
import ApiResponse from '../utilities/apiResponse.js';
import ApiError from '../utilities/apiError.js';
import { asyncHandler } from '../utilities/asyncHandler.js';

export const addTransaction = asyncHandler(async (req, res, next) => {
  const { type, name, quantity, price, date } = req.body;
  const userId = req.user.id;

  logger.info("Transaction attempted", { userId, type, symbol: name });
  const result = await transaction.createTransaction({ userId, type, name, quantity, price, date });

  logger.info("Transaction successful", { userId, transactionId: result._id });
  return res.status(200).json(
    new ApiResponse(200, result, "success")
  );
});

export const getTransactions = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 8;

  logger.info("Get transactions attempted", { userId, page, limit });
  const result = await transaction.getTransactions({ userId, page, limit });

  logger.info("Get transactions successful", { userId });
  return res.status(200).json(
    new ApiResponse(200, result, "success")
  );
});

export const deleteTransaction = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  logger.info("Delete transaction attempted", { userId, transactionId });
  const result = await transaction.removeTransaction({ userId, transactionId });

  logger.info("Delete transaction successful", { userId, transactionId });
  return res.status(200).json(
    new ApiResponse(200, result, "success")
  );
});

export const importTransactions = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new ApiError(400, "No transactions found in CSV");
  }

  logger.info("CSV transaction import attempted", { userId });
  const result = await transaction.importTransactions({ userId, transactions });

  logger.info("CSV transaction import completed", { userId, count: result.importedCount });
  return res.status(200).json(
    new ApiResponse(200, result, "CSV import completed")
  );
});
