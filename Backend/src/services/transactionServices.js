import logger from "../utilities/logger.js";
import { cacheDel } from "../configs/redis.js";
import { Transaction } from "../models/transactionSchema.js";
import { Portfolio } from "../models/portfolioSchema.js";
import mongoose from "mongoose";
import { Holdings } from "../models/holdingSchema.js";
import { createPortfolioSnapshot } from "./portfolioSnapShotServices.js";
import ApiError from "../utilities/apiError.js";
import { resolveNseStock } from "./stockDataServices.js";
import Joi from "joi";

// Joi schema for batch transaction import validation
const importedTransactionSchema = Joi.object({
  type: Joi.string().valid("BUY", "SELL").required().messages({
    "any.only": "Transaction type must be BUY or SELL."
  }),
  name: Joi.string().required().messages({
    "any.required": "Stock name is required."
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.integer": "Quantity must be a whole number.",
    "number.min": "Quantity must be greater than 0."
  }),
  price: Joi.number().positive().required().messages({
    "number.positive": "Price must be greater than 0."
  }),
  date: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).required().messages({
    "string.pattern.base": "Date must be in YYYY-MM-DD format."
  })
});

/**
 * Create a transaction (BUY/SELL) and update holdings accordingly.
 * This function is fully transactional (uses mongoose session).
 */
export const createTransaction = async ({ userId, type, name, quantity, price, date }) => {
  async function getOrCreatePortfolio(userId) {
    let portfolio = await Portfolio.findOne({ user: userId }).lean();
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: userId });
    }
    return portfolio;
  }

  const portfolio = await getOrCreatePortfolio(userId);
  const stock = await resolveNseStock(name);
  const symbol = stock.symbol;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info("Transaction creation attempted", { userId, symbol });

    const [createdTx] = await Transaction.create([{
      Portfolio: portfolio._id,
      transactionType: type,
      symbol,
      quantity,
      pricePerUnit: price,
      date
    }], { session });

    if (type === "BUY") {
      await updateHoldingBuy({ portfolioId: portfolio._id, name: symbol, quantity, price, date, session });
    } else {
      await updateHoldingSell({ portfolioId: portfolio._id, name: symbol, quantity, price, date, session });
    }

    await createPortfolioSnapshot({ 
      portfolioId: portfolio._id,
      session 
    });
    
    await session.commitTransaction();
    session.endSession();

    await cacheDel(`dashboard:v2:${userId}`);
    await cacheDel(`portfolio:v2:${userId}:page`);
    logger.info("User cache invalidated after transactions", { userId });

    return createdTx;
  } catch (error) {
    logger.error("Error while creating transaction", { error });
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Update holdings for a normal BUY (not a delete reverse).
 */
async function updateHoldingBuy({ portfolioId, name, quantity, price, date, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);

  if (!holding) {
    logger.info("Holding created", { portfolioId, symbol: name });
    await Holdings.create([{
      Portfolio: portfolioId,
      symbol: name,
      Quantity: quantity,
      avgBuyPrice: price,
      lastBuyDate: date
    }], { session });
    return;
  }

  const totalQuantity = Number(holding.Quantity) + Number(quantity);
  const totalInvestment = (Number(holding.avgBuyPrice) * Number(holding.Quantity)) + (price * quantity);

  holding.Quantity = totalQuantity;
  holding.avgBuyPrice = totalInvestment / totalQuantity;
  holding.lastBuyDate = date;

  await holding.save({ session });
  logger.info("Holding updated (BUY)", { symbol: name });
}

/**
 * Update holdings for a normal SELL (not a delete reverse).
 */
async function updateHoldingSell({ portfolioId, name, quantity, price, date, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);

  if (!holding) {
    logger.info("Attempted SELL but no holding found", { symbol: name });
    throw new ApiError(400, "Holding not found");
  }

  const totalQuantity = holding.Quantity - quantity;
  if (totalQuantity < 0) {
    throw new ApiError(400, "Invalid quantity");
  }

  if (totalQuantity === 0) {
    await holding.deleteOne({ session });
    logger.info("Holding deleted (SELL left 0)", { symbol: name });
    return;
  }

  holding.Quantity = totalQuantity;
  await holding.save({ session });
  logger.info("Holding updated (SELL)", { symbol: name });
}

/**
 * Transactions listing
 */
export const getTransactions = async ({ userId, page = 1, limit = 8 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 8, 1), 100);
  const skip = (currentPage - 1) * pageSize;
  const portfolio = await Portfolio.findOne({ user: userId }).lean();
  
  if (!portfolio) {
    return {
      transactions: [],
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: 0,
        totalPages: 0
      }
    };
  }

  const [transactions, total] = await Promise.all([
    Transaction.find({ Portfolio: portfolio._id })
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Transaction.countDocuments({ Portfolio: portfolio._id })
  ]);

  return {
    transactions: transactions || [],
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

/**
 * Remove (delete) a single transaction
 */
export const removeTransaction = async ({ userId, transactionId }) => {
  if (!transactionId) {
    throw new ApiError(400, "transactionId is required");
  }

  const portfolio = await Portfolio.findOne({ user: userId }).lean();
  if (!portfolio) {
    throw new ApiError(400, "Portfolio not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletedTx = await Transaction.findOneAndDelete({
      _id: transactionId,
      Portfolio: portfolio._id
    }, { session });

    if (!deletedTx) {
      throw new ApiError(400, "Transaction not found");
    }

    if (deletedTx.transactionType === "SELL") {
      await reverseSell({
        portfolioId: portfolio._id,
        name: deletedTx.symbol,
        quantity: deletedTx.quantity,
        session
      });
    } else if (deletedTx.transactionType === "BUY") {
      await reverseBuy({
        portfolioId: portfolio._id,
        name: deletedTx.symbol,
        transactionId: deletedTx._id,
        session
      });
    }

    await session.commitTransaction();
    session.endSession();

    await cacheDel(`dashboard:v2:${userId}`);
    await cacheDel(`portfolio:v2:${userId}:page`);
    logger.info("User caches invalidated after transaction deletion", { userId });

    return deletedTx;
  } catch (error) {
    logger.error("Error while deleting transaction", { error });
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const validateImportedTransaction = (row) => {
  const { error } = importedTransactionSchema.validate(row);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
};

export const importTransactions = async ({ userId, transactions = [] }) => {
  const imported = [];
  const failed = [];

  for (const [index, row] of transactions.entries()) {
    try {
      validateImportedTransaction(row);
      const created = await createTransaction({
        userId,
        type: row.type,
        name: row.name,
        quantity: row.quantity,
        price: row.price,
        date: row.date
      });
      imported.push(created);
    } catch (error) {
      failed.push({
        row: index + 1,
        name: row.name,
        message: error.message || "Failed to import transaction"
      });
    }
  }

  return {
    importedCount: imported.length,
    failedCount: failed.length,
    failed
  };
};

/**
 * Deleting a SELL transaction => increase holding quantity
 */
async function reverseSell({ portfolioId, name, quantity, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);

  if (!holding) {
    logger.info("reverseSell: holding not found", { symbol: name });
    throw new ApiError(400, "Holding not found while reversing SELL");
  }

  holding.Quantity = holding.Quantity + quantity;
  await holding.save({ session });
  logger.info("reverseSell: holding increased", { symbol: name });
}

/**
 * Deleting a BUY transaction => rebuild holding from remaining BUYs
 */
async function reverseBuy({ portfolioId, name, transactionId, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);
  if (!holding) {
    logger.info("reverseBuy: holding not found", { symbol: name });
    throw new ApiError(400, "Holding not found while reversing BUY");
  }

  const remainingBuys = await Transaction.find({
    Portfolio: portfolioId,
    symbol: name,
    transactionType: "BUY",
    _id: { $ne: transactionId }
  }).session(session);

  if (!remainingBuys || remainingBuys.length === 0) {
    await holding.deleteOne({ session });
    logger.info("reverseBuy: no remaining buys -> holding deleted", { symbol: name });
    return;
  }

  let totalQuantity = 0;
  let totalInvestment = 0;
  for (const buy of remainingBuys) {
    totalQuantity += buy.quantity;
    totalInvestment += (buy.quantity * buy.pricePerUnit);
  }

  holding.Quantity = totalQuantity;
  holding.avgBuyPrice = totalInvestment / totalQuantity;

  remainingBuys.sort((a, b) => new Date(a.date) - new Date(b.date));
  const lastBuy = remainingBuys[remainingBuys.length - 1];
  holding.lastBuyDate = lastBuy.date;

  await holding.save({ session });
  logger.info("reverseBuy: holding recalculated from remaining buys", { symbol: name });
}

const transaction = {
  createTransaction,
  getTransactions,
  removeTransaction,
  importTransactions
};

export default transaction;
