import { Router } from "express";
import { validateTransaction } from "../validators/validateTransaction.js";
import { addTransaction, deleteTransaction, getTransactions } from "../controllers/transactionController.js";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { apiLimiter } from "../middleWares/rateLimiter.js";

const router = Router();

router.post('/add',apiLimiter, verifyJWT, validateTransaction, addTransaction);

router.delete('/remove/:id',apiLimiter, verifyJWT, deleteTransaction);

router.get('/get',apiLimiter, verifyJWT, getTransactions);

export default router