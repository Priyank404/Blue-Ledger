/**
 * Wraps an asynchronous Express request handler function
 * to catch all errors and automatically forward them to next()
 * @param {Function} fn Async express handler
 * @returns {Function} Express middleware wrapper
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
