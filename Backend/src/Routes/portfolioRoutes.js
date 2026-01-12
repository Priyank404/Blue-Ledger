import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getPortfolioValueHistory } from "../controllers/portfolioController.js";
import { getPorfolioAnalytics } from "../controllers/portfolioController.js";

const router = Router();

router.get("/value-history", verifyJWT, getPortfolioValueHistory);

router.get("/analytic", verifyJWT, getPorfolioAnalytics)

export default router;
