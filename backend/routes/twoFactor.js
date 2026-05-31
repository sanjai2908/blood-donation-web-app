const express = require("express");

const twoFactorController = require("../controllers/twoFactorController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/setup", protect, twoFactorController.setupTwoFactor);
router.post("/verify", twoFactorController.verifyTwoFactor);
router.post("/disable", protect, twoFactorController.disableTwoFactor);
router.post("/recovery-login", twoFactorController.recoveryLogin);
router.get("/recovery-codes", protect, twoFactorController.getRecoveryCodes);
router.post(
  "/regenerate-codes",
  protect,
  twoFactorController.regenerateRecoveryCodes,
);

module.exports = router;
