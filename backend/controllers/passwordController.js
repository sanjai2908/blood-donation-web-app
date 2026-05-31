const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

function signResetChallenge(userId) {
  return jwt.sign(
    { id: userId, purpose: "pwd-reset" },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
}

function signResetAllowed(userId) {
  return jwt.sign(
    { id: userId, purpose: "pwd-allow" },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
}

function verifyToken(token, expectedPurpose) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== expectedPurpose) {
      throw new Error("Invalid token purpose");
    }
    return payload;
  } catch (err) {
    throw new AppError("Invalid or expired token.", 401);
  }
}

function auditLog(entry) {
  try {
    const logPath = path.join(__dirname, "..", "security.log");
    const line = `${new Date().toISOString()} ${entry}\n`;
    fs.appendFileSync(logPath, line);
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}

// Rate limiter for reset endpoints
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, try again later." },
});

// Step 1: Start forgot-password flow. Always return generic response.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};

  // Generic response to avoid account enumeration
  const generic = {
    success: true,
    message:
      "If an account exists and has two-factor enabled, follow the verification steps.",
  };

  if (!email) {
    return res.status(200).json(generic);
  }

  const user = await User.findOne({
    email: String(email).toLowerCase(),
  }).select("+twoFactorSecret +twoFactorEnabled");

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    // Do not reveal; just return generic success
    return res.status(200).json(generic);
  }

  // Create a short-lived reset challenge token tied to the user id
  const resetToken = signResetChallenge(user._id);

  // For self-service flows we return the token (local dev / SPA). In production
  // you'd email this or provide a different delivery.
  res.status(200).json({
    ...generic,
    resetToken,
  });
});

// Step 2a: Verify TOTP (authenticator) and grant a one-time password-reset allowance token
const verifyResetTotp = asyncHandler(async (req, res) => {
  const { resetToken, otp } = req.body || {};

  if (!resetToken || !otp) {
    throw new AppError("Invalid request.", 400);
  }

  const payload = verifyToken(resetToken, "pwd-reset");
  const user = await User.findById(payload.id).select(
    "+twoFactorSecret +recoveryCodes",
  );
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError("Invalid request.", 400);
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: String(otp),
    window: 1,
  });

  if (!isValid) {
    auditLog(`PASSWORD_RESET_FAILED_TOTP user=${user.email}`);
    throw new AppError("Invalid verification.", 401);
  }

  const allowToken = signResetAllowed(user._id);
  auditLog(`PASSWORD_RESET_ALLOWED_TOTP user=${user.email}`);

  res.status(200).json({ success: true, allowToken });
});

// Step 2b: Verify recovery code
const verifyResetRecovery = asyncHandler(async (req, res) => {
  const { resetToken, recoveryCode } = req.body || {};

  if (!resetToken || !recoveryCode) {
    throw new AppError("Invalid request.", 400);
  }

  const payload = verifyToken(resetToken, "pwd-reset");
  const user = await User.findById(payload.id).select(
    "+twoFactorSecret +recoveryCodes",
  );
  if (!user || !user.twoFactorEnabled) {
    throw new AppError("Invalid request.", 400);
  }

  const normalizedCode = String(recoveryCode).trim().toUpperCase();

  let matchedIndex = -1;
  for (let i = 0; i < user.recoveryCodes.length; i += 1) {
    // compare hashed codes
    // eslint-disable-next-line no-await-in-loop
    const match = await bcrypt.compare(normalizedCode, user.recoveryCodes[i]);
    if (match) {
      matchedIndex = i;
      break;
    }
  }

  if (matchedIndex < 0) {
    auditLog(`PASSWORD_RESET_FAILED_RECOVERY user=${user.email}`);
    throw new AppError("Invalid verification.", 401);
  }

  // Invalidate the used code
  user.recoveryCodes.splice(matchedIndex, 1);
  await user.save();

  const allowToken = signResetAllowed(user._id);
  auditLog(`PASSWORD_RESET_ALLOWED_RECOVERY user=${user.email}`);

  res.status(200).json({ success: true, allowToken });
});

// Step 3: Reset password using allowToken
const resetPassword = asyncHandler(async (req, res) => {
  const { allowToken, password, confirm } = req.body || {};

  if (!allowToken || !password || !confirm) {
    throw new AppError("Invalid request.", 400);
  }

  if (password !== confirm) {
    throw new AppError("Passwords do not match.", 400);
  }

  if (String(password).length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  const payload = verifyToken(allowToken, "pwd-allow");
  const user = await User.findById(payload.id).select("+password +email");
  if (!user) {
    throw new AppError("Invalid request.", 400);
  }

  user.password = password; // pre-save hook will hash
  await user.save();

  auditLog(`PASSWORD_RESET_COMPLETED user=${user.email}`);

  res
    .status(200)
    .json({ success: true, message: "Password reset successful." });
});

module.exports = {
  forgotPassword,
  verifyResetTotp,
  verifyResetRecovery,
  resetPassword,
  resetLimiter,
};
