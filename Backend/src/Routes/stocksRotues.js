import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import {  getPrice, getPriceBulk, getStockHistoryController } from "../controllers/stockController.js";


const router=Router()

router.get('/:symbol/price', verifyJWT , getPrice)

router.get('/:symbol/history', verifyJWT, getStockHistoryController);

router.post('/price/bulk', verifyJWT, getPriceBulk);


export default router;