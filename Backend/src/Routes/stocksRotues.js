import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import {  getPriceBulk, getStockHistoryController } from "../controllers/stockController.js";


const router=Router()

router.get('/:symbol/history', verifyJWT, getStockHistoryController);

router.post('/price/bulk', verifyJWT, getPriceBulk);


export default router;