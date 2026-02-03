import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getExport } from "../controllers/exportController.js";
import { apiLimiter } from "../middleWares/rateLimiter.js";

const router = Router();

router.get('/',apiLimiter, verifyJWT, getExport);

export default router;