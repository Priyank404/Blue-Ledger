import Joi from "joi";
import logger from "../utilities/logger.js";
import ApiError from "../utilities/apiError.js";

const loginSchema = Joi.object({
  email: Joi.string()
    .pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|net)$/)
    .required()
    .messages({
      "string.pattern.base":
        "Email must be a valid email address ending with .com or .net.",
      "any.required": "Email is required."
    }),

  password: Joi.string()
    .min(3)
    .max(12)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 3 characters.",
      "string.max": "Password must not exceed 12 characters.",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character.",
      "any.required": "Password is required."
    })
});


export const validateLogIn = (req, res, next)=>{
  const { error } = loginSchema.validate(req.body);

  

  if(error){

    const message = error.details[0].message;
    
    logger.error("Validation error at Login route",{
      error: error.details,
      email: req.body.email
    });
    
    return next(new ApiError(400, message))
  }

  next();
}
