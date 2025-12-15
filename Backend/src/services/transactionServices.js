import logger from "../utilities/logger.js";
import { Transaction } from "../models/transactionSchema.js";
import { Portfolio } from "../models/portfolioSchema.js";
import mongoose from "mongoose";
import { Holdings } from "../models/holdingSchema.js";
import ApiError from "../utilities/apiError.js";

/**
 * Create a transaction (BUY/SELL) and update holdings accordingly.
 * This function is fully transactional (uses mongoose session).
 */
export const createTransaction = async ({ userId, type, name, quantity, price, date }) => {
  // helper to get or create portfolio
  async function getOrCreatePortfolio(userId) {
    let portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: userId });
    }
    return portfolio;
  }

  const portfolio = await getOrCreatePortfolio(userId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info("Transaction creation attempted");

    // create transaction inside session (array-form)
    const [createdTx] = await Transaction.create([{
      Portfolio: portfolio._id,
      transactionType: type,
      symbol: name,
      quantity,
      pricePerUnit: price,
      date
    }], { session });

    // call update functions (they use session via closure)
    if (type === "BUY") {
      await updateHoldingBuy({ portfolioId: portfolio._id, name, quantity, price, date, session });
    } else {
      await updateHoldingSell({ portfolioId: portfolio._id, name, quantity, price, date, session });
    }

    await session.commitTransaction();
    session.endSession();

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
 * - If holding doesn't exist -> create it
 * - Else -> update quantity and weighted avg
 *
 * NOTE: session must be passed explicitly.
 */
async function updateHoldingBuy({ portfolioId, name, quantity, price, date, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);

  if (!holding) {
    logger.info("Holding created");
    await Holdings.create([{
      Portfolio: portfolioId,
      symbol: name,
      Quantity: quantity,
      avgBuyPrice: price,
      lastBuyDate: date
    }], { session });
    return;
  }

  // existing holding -> weighted average
  const totalQuantity = holding.Quantity + quantity;
  const totalInvestment = (holding.avgBuyPrice * holding.Quantity) + (price * quantity);

  holding.Quantity = totalQuantity;
  holding.avgBuyPrice = totalInvestment / totalQuantity;
  holding.lastBuyDate = date;

  await holding.save({ session });
  logger.info("Holding updated (BUY)");
}

/**
 * Update holdings for a normal SELL (not a delete reverse).
 * - Validate quantity
 * - Decrease quantity
 * - If quantity becomes 0 -> delete holding
 *
 * NOTE: session must be passed explicitly.
 */
async function updateHoldingSell({ portfolioId, name, quantity, price, date, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);

  if (!holding) {
    logger.info("Attempted SELL but no holding found");
    throw new ApiError(400, "Holding not found");
  }

  const totalQuantity = holding.Quantity - quantity;
  if (totalQuantity < 0) {
    throw new ApiError(400, "Invalid quantity");
  }

  if (totalQuantity === 0) {
    // delete the single holding document
    await holding.deleteOne({ session });
    logger.info("Holding deleted (SELL left 0)");
    return;
  }

  holding.Quantity = totalQuantity;
  await holding.save({ session });
  logger.info("Holding updated (SELL)");
}

/* ---------------------------
   Transactions listing
   --------------------------- */
export const getTransactions = async ({ userId }) => {
  const portfolio = await Portfolio.findOne({ user: userId });
  

  const transactions = await Transaction.find({ Portfolio: portfolio._id });
  

  return transactions;
};

/* ---------------------------
   Remove (delete) a single transaction
   - Must be atomic: delete transaction + update holdings in same session
   - Must reverse effects:
     * If deleted transaction is SELL -> increase holding quantity (avg unchanged)
     * If deleted transaction is BUY -> recalc holdings from remaining BUYs
   - Input: userId and transactionId (transaction to delete)
   --------------------------- */
export const removeTransaction = async ({ userId, transactionId }) => {
  if (!transactionId) {
    throw new ApiError(400, "transactionId is required");
  }

  const portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    throw new ApiError(400, "Portfolio not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // find & delete the specific transaction for this portfolio
    const deletedTx = await Transaction.findOneAndDelete({
      _id: transactionId,
      Portfolio: portfolio._id
    }, { session });

    if (!deletedTx) {
      throw new ApiError(400, "Transaction not found");
    }

    // reverse the deleted transaction's effect
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

    return deletedTx;
  } catch (error) {
    logger.error("Error while deleting transaction", { error });
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/* ---------------------------
   reverseSell: deleting a SELL transaction => increase holding quantity
   --------------------------- */
async function reverseSell({ portfolioId, name, quantity, session }) {
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);

  if (!holding) {
    // If there is no holding, it's possible the sell existed alone (we can't reconstruct avg)
    // Decision: throw an error to avoid inconsistent state. Alternatively you could create a holding,
    // but you would not have a cost basis (avgBuyPrice). Safer to enforce integrity.
    logger.info("reverseSell: holding not found");
    throw new ApiError(400, "Holding not found while reversing SELL");
  }

  holding.Quantity = holding.Quantity + quantity;
  await holding.save({ session });
  logger.info("reverseSell: holding increased");
}

/* ---------------------------
   reverseBuy: deleting a BUY transaction => rebuild holding from remaining BUYs
   Steps:
     1) Fetch remaining BUY transactions for the same portfolio+symbol excluding deleted id
     2) If none remain -> delete holding
     3) Else compute total qty and total investment and set avgBuyPrice
   --------------------------- */
async function reverseBuy({ portfolioId, name, transactionId, session }) {
  // fetch existing holding
  const holding = await Holdings.findOne({ Portfolio: portfolioId, symbol: name }).session(session);
  if (!holding) {
    logger.info("reverseBuy: holding not found");
    throw new ApiError(400, "Holding not found while reversing BUY");
  }

  // fetch remaining BUY transactions (exclude the deleted one)
  const remainingBuys = await Transaction.find({
    Portfolio: portfolioId,
    symbol: name,
    transactionType: "BUY",
    _id: { $ne: transactionId }
  }).session(session);

  // if no BUYs left, delete the holding
  if (!remainingBuys || remainingBuys.length === 0) {
    await holding.deleteOne({ session });
    logger.info("reverseBuy: no remaining buys -> holding deleted");
    return;
  }

  // recalc totals
  let totalQuantity = 0;
  let totalInvestment = 0;
  for (const buy of remainingBuys) {
    totalQuantity += buy.quantity;
    totalInvestment += (buy.quantity * buy.pricePerUnit);
  }

  // update holding
  holding.Quantity = totalQuantity;
  holding.avgBuyPrice = totalInvestment / totalQuantity;

  // lastBuyDate should be the date of the most recent BUY remaining
  // sort remaining buys by date to be safe (they might not be ordered)
  remainingBuys.sort((a, b) => new Date(a.date) - new Date(b.date));
  const lastBuy = remainingBuys[remainingBuys.length - 1];
  holding.lastBuyDate = lastBuy.date;

  await holding.save({ session });
  logger.info("reverseBuy: holding recalculated from remaining buys");
}

const transaction = {
  createTransaction,
  getTransactions,
  removeTransaction
};

export default transaction;
