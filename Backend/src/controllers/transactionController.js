import logger from '../utilities/logger.js';
import { transaction } from '../services/transactionServices.js';
import ApiResponse from '../utilities/apiResponse.js';
import { Logger } from 'winston';

export const addtransaction = async (req, res, next) => {
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
        logger.error("Error while creating transaction", {error});
        next(error);
    }
}

export const getTransactions = async (req, res, next) =>{
    try {
        const userId = req.user.id;

        logger.info("Get transactions attemped");
        const result = await transaction.getTransactions({userId});

        logger.info("Get transactions successful");

        return res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while getting transactions", {error});
        next(error);
    }
}

export const deleteTransaction = async (req, res, next) =>{
    try {
        const userId = req.user.id;

        logger.info("Delete transaction attemped");
        const result = await transaction.deleteTransaction({userId});

        logger.info("Delete transaction successful");

        return res.status(200).json(
            new ApiResponse(200, result, "success")
        )
    } catch (error) {
        logger.error("Error while deleting transaction", {error});
        next(error)
    }
}