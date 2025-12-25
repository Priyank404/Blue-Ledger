import jwt from "jsonwebtoken";
import ApiError from "../utilities/apiError.js";

export const verifyJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;

    console.log("Cookies received by backend:", req.cookies);


    if (!token) {
      return next(new ApiError(401, "Unauthorized - No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user data to req
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
