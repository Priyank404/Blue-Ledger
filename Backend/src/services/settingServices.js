import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import ApiError from "../utilities/apiError.js";
import mongoose from "mongoose";

export const updateProfileService = async (
  userId,
  email,
  currentPassword,
  newPassword,
) => {
  // 1️⃣ Validate userId
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // 2️⃣ currentPassword is mandatory for security
  if (!currentPassword) {
    throw new ApiError(400, "Current password is required");
  }

  // 3️⃣ Fetch user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // 4️⃣ Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid current password");
  }

  // 5️⃣ Prepare update object
  const updateData = {};

  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== userId) {
      throw new ApiError(400, "Email already in use");
    }
    updateData.email = email;
  }

  if (newPassword) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(newPassword, salt);
  }

  // 6️⃣ Prevent empty update
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update");
  }

  // 7️⃣ Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  );

  // 8️⃣ Remove password before returning
  updatedUser.password = undefined;

  return updatedUser;
};
