import Joi from "joi";
import logger from "../utilities/logger.js";

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/@(.*)(\.com|\.net)$/)
    .required()
    .messages({
      "string.email": "Email must be a valid email address.",
      "string.pattern.base": "Email must end with .com or .net.",
      "any.required": "Email is required."
    }),

  password: Joi.string()
    .min(3)
    .max(12)
    .pattern(/^(?=.*[a-z])/)         
    .pattern(/^(?=.*[A-Z])/)         
    .pattern(/^(?=.*\d)/)            
    .pattern(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      "string.min": "Password must be at least 3 characters.",
      "string.max": "Password must not exceed 12 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number, and one special character.",
      "any.required": "Password is required."
    }),
});

export const validateLogIn = (req, res, next)=>{
  const { error } = loginSchema.validate(req.body);

  if(error){
    logger.error("Validation error at Login route",{
      error: error.details,
      email: req.body.email
    });
    
    return next(new ApiError(400, "Validation error", error.details))
  }

  next();
}
