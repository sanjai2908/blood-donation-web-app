const express = require("express");
const requestController = require("../controllers/requestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/requests",
  protect,
  authorizeRoles("receiver", "admin"),
  requestController.createBloodRequest,
);
router.post(
  "/request-blood",
  protect,
  authorizeRoles("receiver", "admin"),
  requestController.createBloodRequest,
);

router.get(
  "/requests",
  protect,
  authorizeRoles("admin"),
  requestController.getAllRequests,
);
router.get(
  "/requests/all",
  protect,
  authorizeRoles("admin"),
  requestController.getAllRequests,
);
router.get(
  "/requests/me",
  protect,
  authorizeRoles("receiver"),
  requestController.getRequestHistory,
);
router.get(
  "/requests/history",
  protect,
  authorizeRoles("receiver"),
  requestController.getRequestHistory,
);
router.get(
  "/requests/donor",
  protect,
  authorizeRoles("donor"),
  requestController.getDonorFeed,
);

router.put(
  "/requests/:id/status",
  protect,
  authorizeRoles("donor", "admin", "receiver"),
  requestController.updateRequestStatus,
);
router.put(
  "/request/:id",
  protect,
  authorizeRoles("donor", "admin", "receiver"),
  requestController.updateRequestStatus,
);

module.exports = router;
