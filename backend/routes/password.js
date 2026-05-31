const express = require("express");
const {
  forgotPassword,
  verifyResetTotp,
  verifyResetRecovery,
  resetPassword,
  resetLimiter,
} = require("../controllers/passwordController");

const router = express.Router();

// Start forgot password flow (enter email)
router.post("/auth/forgot-password", resetLimiter, forgotPassword);

// Verify using authenticator TOTP
router.post("/auth/verify-reset-otp", resetLimiter, verifyResetTotp);

// Verify using a recovery code (consumes the code)
router.post("/auth/verify-reset-recovery", resetLimiter, verifyResetRecovery);

// Finalize password reset
router.post("/auth/reset-password", resetLimiter, resetPassword);

module.exports = router;
