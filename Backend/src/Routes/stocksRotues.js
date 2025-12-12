import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getPrice } from "../controllers/stockController.js";


const router=Router()

router.get('/price/:symbol', verifyJWT, getPrice);

export default router;