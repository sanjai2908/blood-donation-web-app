const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

function notFound(req, res, next) {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  console.error("API error:", err);

  try {
    const logPath = path.join(__dirname, "..", "error.log");
    const logEntry = [
      new Date().toISOString(),
      `${req.method} ${req.originalUrl}`,
      err && err.stack ? err.stack : String(err),
      "",
    ].join("\n");
    fs.appendFileSync(logPath, logEntry);
  } catch (logError) {
    console.error("Failed to write error log:", logError);
  }

  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") {
    error = new AppError("Invalid resource id.", 400);
  }

  if (err.code === 11000) {
    error = new AppError("Duplicate value entered.", 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(". ");
    error = new AppError(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Your token has expired. Please log in again.", 401);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  res.status(statusCode).json({
    success: false,
    status,
    message: error.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
