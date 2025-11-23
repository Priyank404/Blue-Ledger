import { Router } from "express";
import { validateTransaction } from "../validators/validateTransaction.js";
import { addTransaction, deleteTransaction, getTransactions } from "../controllers/transactionController.js";
import { verifyJWT } from "../middleWares/verifyJWT.js";

const router = Router();

router.post('/add',verifyJWT, validateTransaction, addTransaction);

router.delete('/remove/:id', verifyJWT, deleteTransaction);

router.get('/get', verifyJWT, getTransactions);

export default router