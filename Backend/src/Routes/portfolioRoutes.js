import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getPortfolioValueHistory } from "../controllers/portfolioController.js";
import { getPorfolioAnalytics } from "../controllers/portfolioController.js";
import { apiLimiter } from "../middleWares/rateLimiter.js";

const router = Router();

router.get("/value-history",apiLimiter, verifyJWT, getPortfolioValueHistory);

router.get("/analytic",apiLimiter, verifyJWT, getPorfolioAnalytics)

export default router;
