import { Router } from "express";
import {verifyJWT} from "../middleWares/verifyJWT.js";
import { updateProfile } from "../controllers/settingController.js";

const router = Router()

router.patch('/profile',verifyJWT, updateProfile);

export default router
