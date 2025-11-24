import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { Holdings } from "../controllers/holdingController.js";

const router = Router();

router.get('/get', verifyJWT, Holdings);

export default router