import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import {  getPrice, getPriceBulk, getStockHistoryController, getPriceBulkCached, getPriceCached, getStockDetails } from "../controllers/stockController.js";


const router=Router()

router.get('/:symbol/price', verifyJWT , getPrice)

router.get('/:symbol/history', verifyJWT, getStockHistoryController);

router.post('/price/bulk', verifyJWT, getPriceBulk);

router.get("/:symbol/price/cached", verifyJWT, getPriceCached);

// POST /api/stock/bulk/price/cached (cached version)
router.post("/bulk/price/cached", verifyJWT, getPriceBulkCached);

// for single stock detials (complete stock details)
router.get("/details/:symbol", verifyJWT, getStockDetails);


export default router;