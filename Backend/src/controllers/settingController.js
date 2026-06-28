import logger from "../utilities/logger.js";
import ApiResponse from "../utilities/apiResponse.js";
import { updateProfileService } from "../services/settingServices.js";
import { asyncHandler } from "../utilities/asyncHandler.js";

export const updateProfile = asyncHandler(async (req, res, next) => {
  logger.info("Attempt for email/password changes");

  const userId = req.user.id;
  const { email, currentPassword, newPassword } = req.body;

  await updateProfileService(userId, email, currentPassword, newPassword);

  logger.info("Email/password changed successfully");
  return res.status(200).json(
    new ApiResponse(200, null, "Profile updated successfully")
  );
});