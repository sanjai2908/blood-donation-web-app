const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const tokenFromCookie = req.cookies?.token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    throw new AppError("You are not logged in.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Your session expired. Please log in again.", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  req.user = user;
  next();
});

const authorizeRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action.",
        403,
      );
    }

    next();
  });

module.exports = {
  protect,
  authorizeRoles,
};
