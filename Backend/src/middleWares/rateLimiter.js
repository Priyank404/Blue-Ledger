import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 attempts
  message: "Too many login attempts. Try again later."
});


export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "OTP limit reached. Try later."
});


export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please wait a few seconds and try again."

})


