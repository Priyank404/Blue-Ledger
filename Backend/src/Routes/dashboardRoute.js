import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getDashboard } from "../controllers/dashboardController.js";
import { apiLimiter } from "../middleWares/rateLimiter.js";

const router = Router();

router.get('/',apiLimiter, verifyJWT, getDashboard);

export default router;