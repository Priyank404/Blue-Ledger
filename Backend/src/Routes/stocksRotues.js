import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import {  getPrice, getPriceBulk, getStockHistoryController, getPriceBulkCached, getPriceCached, getStockDetails, resolveStock } from "../controllers/stockController.js";
import { apiLimiter } from "../middleWares/rateLimiter.js";


const router=Router()

router.get('/resolve',apiLimiter, verifyJWT, resolveStock);

router.get('/:symbol/price',apiLimiter, verifyJWT , getPrice)

router.get('/:symbol/history',apiLimiter, verifyJWT, getStockHistoryController);

router.post('/price/bulk',apiLimiter, verifyJWT, getPriceBulk);

router.get("/:symbol/price/cached",apiLimiter, verifyJWT, getPriceCached);

// POST /api/stock/bulk/price/cached (cached version)
router.post("/bulk/price/cached",apiLimiter, verifyJWT, getPriceBulkCached);

// for single stock detials (complete stock details)
router.get("/details/:id",apiLimiter, verifyJWT, getStockDetails);


export default router;
