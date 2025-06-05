/**
 * @fileoverview Error handling utilities
 */

/**
 * Custom API Error class
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create a custom API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value} for ${field} field. Please use another value.`;
    err = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    err = new AppError(message, 400);
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    err = new AppError(message, 400);
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token. Please log in again.", 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    err = new AppError("Your token has expired. Please log in again.", 401);
  }

  // Development error response (with stack trace)
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production error response (without sensitive error details)
  // For operational errors (expected errors), send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // For programming or unknown errors, don't leak error details
  console.error("ERROR 💥:", err);
  return res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong",
  });
};

module.exports = {
  AppError,
  globalErrorHandler,
};
