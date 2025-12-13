import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getPrice, getPriceBulk } from "../controllers/stockController.js";


const router=Router()

router.get('/price/:symbol', verifyJWT, getPrice);

router.post('/price/bulk', verifyJWT, getPriceBulk);


export default router;