
import { Router } from 'express';
import { validateSignIn } from '../validators/validateSignIn.js';
import { validateLogIn } from '../validators/validateLogin.js';
import { signUp, logIn, logOut } from '../controllers/authController.js';
import { verifyJWT } from '../middleWares/verifyJWT.js';
import { getMe } from '../controllers/authController.js';
import { verifyOtpLogin } from "../controllers/authController.js";
import { sendOtp } from '../controllers/otpController.js';

const router = Router();

router.get('/me', verifyJWT, getMe);

router.post('/signup', validateSignIn, signUp);

router.post('/login', validateLogIn, logIn);

router.post('/logout', logOut)


router.post("/otp/send", sendOtp)

router.post("/otp/verify", verifyOtpLogin);


export default router;