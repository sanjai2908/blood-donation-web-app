const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/register", authController.register);

router.post("/auth/login", authController.login);
router.post("/login", authController.login);

router.post("/auth/logout", protect, authController.logout);
router.post("/logout", protect, authController.logout);

router.get("/auth/me", protect, authController.getMe);
router.get("/profile", protect, authController.getMe);

router.put("/auth/profile", protect, authController.updateProfile);
router.put("/profile", protect, authController.updateProfile);

module.exports = router;
