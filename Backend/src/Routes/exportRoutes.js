import { Router } from "express";
import { verifyJWT } from "../middleWares/verifyJWT.js";
import { getExport } from "../controllers/exportController.js";

const router = Router();

router.get('/', verifyJWT, getExport);

export default router;