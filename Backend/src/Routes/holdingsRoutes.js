import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { Holdings } from "../controllers/holdingController.js";
import { apiLimiter } from "../middleWares/rateLimiter.js";

const router = Router();

router.get('/get',apiLimiter, verifyJWT, Holdings);

export default router