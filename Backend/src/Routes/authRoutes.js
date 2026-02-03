
import { Router } from 'express';
import { validateSignIn } from '../validators/validateSignIn.js';
import { validateLogIn } from '../validators/validateLogin.js';
import { signUp, logIn, logOut, googleLogin } from '../controllers/authController.js';
import { verifyJWT } from '../middleWares/verifyJWT.js';
import { getMe } from '../controllers/authController.js';
import { verifyOtpLogin } from "../controllers/authController.js";
import { sendOtp } from '../controllers/otpController.js';
import { loginLimiter, otpLimiter } from '../middleWares/rateLimiter.js';

const router = Router();

router.get('/me', verifyJWT, getMe);

router.post('/logout', logOut)


router.post("/otp/send",otpLimiter, sendOtp)

router.post("/otp/verify",loginLimiter, verifyOtpLogin);

router.post("/google/login",loginLimiter, googleLogin)

export default router;