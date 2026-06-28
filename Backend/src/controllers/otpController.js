import logger from "../utilities/logger.js";
import { otpGenerator, otpVerify } from "../services/otpServices.js";
import ApiResponse from "../utilities/apiResponse.js";
import { sendOtpEmail } from "../services/emailServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const sendOtp = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  logger.info("OTP generating attempted", { email });

  const otp = await otpGenerator(email);
  await sendOtpEmail(email, otp);

  logger.info("OTP generating successful", { email });
  return res.status(200).json(new ApiResponse(200, otp, "success"));
});

export const verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  logger.info("Checking OTP", { email });

  await otpVerify(email, otp);

  logger.info("OTP verified successfully", { email });
  return res.status(200).json(new ApiResponse(200, null, "success"));
});