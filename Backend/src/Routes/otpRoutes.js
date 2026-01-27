import Routes from "express"
import {verifyJWT} from "../middleWares/verifyJWT.js"
import { otpController } from "../controllers/otpController.js"

const routes = Routes()

routes.post("/generate",verifyJWT, otpController)

export default routes