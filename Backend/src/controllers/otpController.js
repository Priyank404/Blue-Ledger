import logger from "../utilities/logger.js";
import { otpGenerator } from "../services/otpServices.js";
import ApiResponse from "../utilities/apiResponse.js";

export const otpController = async(req, res, next)=>{
    try {
        const email =  req.user.email;
        logger.info("OTP generationg attemped", {email})

        const otp = await otpGenerator(email)

        logger.info("OTP generationg successful", {email})
        return res.status(200).json(new ApiResponse(200, otp, "success"));
    } catch (error) {
        logger.error("Error while generating OTP", {error});
        next(error);
    }
}