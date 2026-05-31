const express = require("express");
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const requestController = require("../controllers/requestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/admin/dashboard",
  protect,
  authorizeRoles("admin"),
  adminController.getDashboard,
);
router.get(
  "/admin/requests/recent",
  protect,
  authorizeRoles("admin"),
  adminController.getRecentRequests,
);
router.get(
  "/admin/users",
  protect,
  authorizeRoles("admin"),
  userController.listUsers,
);
router.put(
  "/admin/users/:id",
  protect,
  authorizeRoles("admin"),
  adminController.updateUser,
);
router.delete(
  "/admin/users/:id",
  protect,
  authorizeRoles("admin"),
  userController.deleteUser,
);
router.get(
  "/admin/requests",
  protect,
  authorizeRoles("admin"),
  requestController.getAllRequests,
);

module.exports = router;
