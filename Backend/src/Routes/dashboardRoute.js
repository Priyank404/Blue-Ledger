import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get('/', verifyJWT, getDashboard);

export default router;