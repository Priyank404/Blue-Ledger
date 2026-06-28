import logger from "../utilities/logger.js";

/**
 * Central Express error handling middleware.
 * Differentiates operational client errors from unhandled system crashes.
 */
const globalErrorHandler = (err, req, res, next) => {
  // Safe guard fallback if error is undefined or not an object
  if (!err || typeof err !== "object") {
    err = { statusCode: 500, message: (err && String(err)) || "Unknown error" };
  }
  
  const statusCode = err.statusCode || err.status || 500;

  // Operational Client Errors (4xx)
  if (statusCode < 500) {
    logger.warn("Operational API Error", {
      statusCode,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
      errors: err.errors || [],
    });
  }

  // Unhandled system errors (500)
  logger.error("Internal Server Error Exception", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default globalErrorHandler;
