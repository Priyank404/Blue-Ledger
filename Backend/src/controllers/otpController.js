import logger from "../utilities/logger.js";
import { otpGenerator, otpVerify } from "../services/otpServices.js";
import ApiResponse from "../utilities/apiResponse.js";
import { sendOtpEmail } from "../services/emailServices.js";

export const sendOtp = async(req, res, next)=>{
    try {
        const email =  req.body.email;
        logger.info("OTP generationg attemped", {email})

        const otp = await otpGenerator(email)

        await sendOtpEmail(email, otp)

        logger.info("OTP generationg successful", {email})
        return res.status(200).json(new ApiResponse(200, otp, "success"));
    } catch (error) {
        logger.error("Error while generating OTP", {error});
        next(error);
    }
}

export const verifyOtp = async(req, res, next)=>{
    try {
        const { email, otp } = req.body;
        
        logger.info("checking OTP",{email})

        await otpVerify(email, otp);

        logger.info("OTP verified successfully",{email})

        return res.status(200).json(new ApiResponse(200, null, "success"));
    } catch (error) {
        
    }
}