import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getPortfolioValueHistory } from "../controllers/portfolioController.js";

const router = Router();

router.get("/value-history", verifyJWT, getPortfolioValueHistory);

export default router;
