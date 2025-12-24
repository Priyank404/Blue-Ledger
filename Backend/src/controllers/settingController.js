import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import { updateProfileService } from "../services/settingServices.js";

export const updateProfile = async (req, res, next) =>{
    try {
        logger.info("attemp for email/password changes")

        const userId = req.user.id;
        const {email, currentPassword,newPassword} = req.body

        const response = await updateProfileService(userId,email,currentPassword,newPassword);

        logger.info("email/password changed successfully")
        return res.status(200).json(
            new ApiResponse(200, null, "Profile updated successfully")
        );


    } catch (error) {
        logger.error("faile to change email and password", {error})
        next(error)
    }
}