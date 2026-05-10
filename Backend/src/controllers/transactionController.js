import logger from '../utilities/logger.js';
import  transaction  from '../services/transactionServices.js';
import ApiResponse from '../utilities/apiResponse.js';
import ApiError from '../utilities/apiError.js';
import { Logger } from 'winston';

export const addTransaction = async (req, res, next) => {
    try {
        const{type,name,quantity,price,date} = req.body;
        
        const userId = req.user.id;

        logger.info("Transaction attemped");

        const result = await transaction.createTransaction({userId,type,name,quantity,price,date});

        logger.info("Transaction successful");

        return res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while generating OTP", {
                    message: error.message,
                    stack: error.stack
                });
        next(error);
    }
}

export const getTransactions = async (req, res, next) =>{
    try {
        const userId = req.user.id;
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 8;

        logger.info("Get transactions attemped");
        const result = await transaction.getTransactions({userId, page, limit});

        logger.info("Get transactions successful");

        return res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while generating OTP", {
                    message: error.message,
                    stack: error.stack
                });
        next(error);
    }
}

export const deleteTransaction = async (req, res, next) =>{
    try {
        const userId = req.user.id;

        logger.info("Delete transaction attemped");
        const result = await transaction.removeTransaction({userId, transactionId:req.params.id});

        logger.info("Delete transaction successful");

        return res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while generating OTP", {
                    message: error.message,
                    stack: error.stack
                });
        next(error)
    }
}

export const importTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            throw new ApiError(400, "No transactions found in CSV");
        }

        logger.info("CSV transaction import attempted");
        const result = await transaction.importTransactions({ userId, transactions });

        logger.info("CSV transaction import completed");
        return res.status(200).json(
            new ApiResponse(200, result, "CSV import completed")
        );
    } catch (error) {
        logger.error("Error while importing transactions", {
            message: error.message,
            stack: error.stack
        });
        next(error);
    }
}
