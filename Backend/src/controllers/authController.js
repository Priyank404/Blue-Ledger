import logger from "../utilities/logger.js"
import authServices from '../services/authServices.js';
import ApiResponse from "../utilities/apiResponse.js";
import { otpVerify } from "../services/otpServices.js";
import { sendWelcomEmail } from "../services/emailServices.js";
import { verifyGoogleToken } from "../services/googleAuthServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const signUp = asyncHandler(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  logger.info("User signup attempted", { email });
  const result = await authServices.registerUser({ email, password, confirmPassword });
  logger.info("User signup successful", { email });

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });

  logger.info("cookie set successfully");

  return res.status(200).json(
    new ApiResponse(200, result.user, "success")      
  );
});

export const logIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  logger.info("User login attempted", { email });
  const result = await authServices.logInUser({ email, password });
  logger.info("User login successful", { email });

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });

  logger.info("cookie set successfully");

  return res.status(200).json(
    new ApiResponse(200, result.user, "success")
  );
});

export const logOut = asyncHandler(async (req, res, next) => {
  logger.info("user Logging out");
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  logger.info("cookie cleared successfully");

  return res.status(200).json(new ApiResponse(200, {}, "success"));
});

export const getMe = asyncHandler(async (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  const user = await authServices.getUserById(req.user.id);

  return res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
    },
  });
});

export const verifyOtpLogin = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  logger.info("OTP verification attempted", { email });
  await otpVerify(email, otp);

  const result = await authServices.loginWithOtp(email);

  if (result.isNewUser) {
    await sendWelcomEmail(email);
  }

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });

  logger.info("OTP login successful", { email });

  return res.status(200).json(
    new ApiResponse(200, result.user, "success")
  );
});

export const googleLogin = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  logger.info("Token received");
  const googleUser = await verifyGoogleToken(token);

  logger.info("Token verified successfully");
  const result = await authServices.loginWithGoogle(googleUser);

  logger.info("login with Google successfully");
  if (result.isNewUser) {
    await sendWelcomEmail(result.user.email);
  }

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.json(result.user);
});
