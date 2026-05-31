const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");

function sanitizeUser(user) {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.password;
  delete plainUser.twoFactorSecret;
  delete plainUser.recoveryCodes;
  return plainUser;
}

function sendTokenResponse(user, res) {
  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
}

function signTwoFactorChallenge(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      purpose: "2fa-login",
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      phone,
      bloodGroup,
      city,
      role,
      availabilityStatus,
    } = req.body;

    if (!name || !email || !password || !phone || !city || !role) {
      throw new AppError(
        "Name, email, password, phone, city, and role are required.",
        400,
      );
    }

    if (!["donor", "receiver"].includes(role)) {
      throw new AppError(
        "Public registration is limited to donor and receiver roles.",
        400,
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("An account already exists with this email.", 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      bloodGroup: role === "donor" ? bloodGroup || "" : "",
      city,
      role,
      availabilityStatus:
        role === "donor"
          ? availabilityStatus !== false && availabilityStatus !== "false"
          : false,
    });

    sendTokenResponse(user, res);
  } catch (error) {
    console.error("Register failed:", error);

    if (typeof next === "function") {
      return next(error);
    }

    throw error;
  }
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email }).select(
    "+password +twoFactorSecret +recoveryCodes",
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const twoFactorToken = signTwoFactorChallenge(user);

    return res.status(200).json({
      success: true,
      requiresTwoFactor: true,
      twoFactorToken,
      user: {
        _id: user._id,
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  sendTokenResponse(user, res);
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const editableFields = [
    "name",
    "phone",
    "city",
    "bloodGroup",
    "availabilityStatus",
    "password",
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  if (req.user.role !== "donor") {
    req.user.bloodGroup = "";
    req.user.availabilityStatus = false;
  }

  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: sanitizeUser(req.user),
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};
