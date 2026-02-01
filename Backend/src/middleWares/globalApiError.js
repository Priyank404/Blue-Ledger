const globalErrorHandler = (err, req, res, next) => {
  // Guard: prevent handler from throwing if next() was called with no/weird arg (would kill process)
  if (!err || typeof err !== "object") {
    err = { statusCode: 500, message: err && String(err) || "Unknown error" };
  }
  const statusCode = err.statusCode || err.status || 500;

  // Known (operational) errors
  if (statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
      errors: err.errors || [],
    });
  }

  // Unknown / programming errors
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default globalErrorHandler;
