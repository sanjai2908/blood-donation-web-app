const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");

function sanitizeUser(user) {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.password;
  delete plainUser.twoFactorSecret;
  delete plainUser.recoveryCodes;
  return plainUser;
}

function verifyChallengeToken(token, expectedPurpose) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired 2FA token.", 401);
  }

  if (payload.purpose !== expectedPurpose) {
    throw new AppError("Invalid 2FA token purpose.", 401);
  }

  return payload;
}

async function getUserFromAccessToken(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw new AppError("Authentication token is required.", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired session token.", 401);
  }

  const user = await User.findById(payload.id).select(
    "+twoFactorSecret +recoveryCodes",
  );
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
}

function generateRecoveryCodes() {
  return Array.from({ length: 10 }, () => {
    const left = crypto.randomBytes(2).toString("hex").toUpperCase();
    const right = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `${left}-${right}`;
  });
}

async function hashRecoveryCodes(codes) {
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}

const setupTwoFactor = asyncHandler(async (req, res) => {
  if (req.user.twoFactorEnabled) {
    throw new AppError("Two-factor authentication is already enabled.", 400);
  }

  const secret = speakeasy.generateSecret({
    name: `Blood Donation Hub (${req.user.email})`,
    issuer: "Blood Donation Hub",
    length: 32,
  });

  const user = await User.findById(req.user._id).select("+twoFactorSecret");
  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.status(200).json({
    success: true,
    message: "Scan the QR code and verify with a 6-digit code.",
    qrCodeDataUrl,
  });
});

const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { twoFactorToken, otp } = req.body;

  if (!otp || !/^\d{6}$/.test(String(otp))) {
    throw new AppError("A valid 6-digit OTP is required.", 400);
  }

  if (!twoFactorToken) {
    const user = await getUserFromAccessToken(req);

    if (!user.twoFactorSecret) {
      throw new AppError("Run 2FA setup before verification.", 400);
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: String(otp),
      window: 1,
    });

    if (!isValid) {
      throw new AppError("Invalid authenticator code.", 400);
    }

    const recoveryCodes = generateRecoveryCodes();
    user.twoFactorEnabled = true;
    user.recoveryCodes = await hashRecoveryCodes(recoveryCodes);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled successfully.",
      recoveryCodes,
      user: sanitizeUser(user),
    });
  }

  const loginPayload = verifyChallengeToken(twoFactorToken, "2fa-login");
  const user = await User.findById(loginPayload.id).select(
    "+twoFactorSecret +recoveryCodes",
  );

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError(
      "Two-factor authentication is not enabled for this account.",
      400,
    );
  }

  const isValidOtp = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: String(otp),
    window: 1,
  });

  if (!isValidOtp) {
    throw new AppError("Invalid authenticator code.", 401);
  }

  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError(
      "Password confirmation is required to disable 2FA.",
      400,
    );
  }

  const user = await User.findById(req.user._id).select(
    "+password +twoFactorSecret +recoveryCodes",
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Password confirmation failed.", 401);
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = "";
  user.recoveryCodes = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: "Two-factor authentication disabled.",
    user: sanitizeUser(user),
  });
});

const recoveryLogin = asyncHandler(async (req, res) => {
  const { twoFactorToken, recoveryCode } = req.body;

  if (!twoFactorToken || !recoveryCode) {
    throw new AppError("2FA token and recovery code are required.", 400);
  }

  const payload = verifyChallengeToken(twoFactorToken, "2fa-login");
  const user = await User.findById(payload.id).select(
    "+twoFactorSecret +recoveryCodes",
  );

  if (!user || !user.twoFactorEnabled) {
    throw new AppError(
      "Two-factor authentication is not enabled for this account.",
      400,
    );
  }

  const normalizedCode = String(recoveryCode).trim().toUpperCase();

  let matchedIndex = -1;
  for (let index = 0; index < user.recoveryCodes.length; index += 1) {
    const isMatch = await bcrypt.compare(
      normalizedCode,
      user.recoveryCodes[index],
    );
    if (isMatch) {
      matchedIndex = index;
      break;
    }
  }

  if (matchedIndex < 0) {
    throw new AppError("Invalid or already used recovery code.", 401);
  }

  user.recoveryCodes.splice(matchedIndex, 1);
  await user.save();

  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user),
    message: "Recovery code accepted. Generate new codes if needed.",
  });
});

const getRecoveryCodes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+recoveryCodes");

  res.status(200).json({
    success: true,
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    remainingCodes: user.recoveryCodes.length,
    message: "Recovery codes are only shown once when created or regenerated.",
  });
});

const regenerateRecoveryCodes = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError(
      "Password confirmation is required to regenerate recovery codes.",
      400,
    );
  }

  const user = await User.findById(req.user._id).select(
    "+password +twoFactorSecret +recoveryCodes",
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Password confirmation failed.", 401);
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError(
      "Enable two-factor authentication before generating recovery codes.",
      400,
    );
  }

  const recoveryCodes = generateRecoveryCodes();
  user.recoveryCodes = await hashRecoveryCodes(recoveryCodes);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Recovery codes regenerated successfully.",
    recoveryCodes,
  });
});

module.exports = {
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  recoveryLogin,
  getRecoveryCodes,
  regenerateRecoveryCodes,
};
