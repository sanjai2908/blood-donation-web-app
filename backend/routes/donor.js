const express = require("express");
const userController = require("../controllers/userController");
const requestController = require("../controllers/requestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/donors",
  protect,
  authorizeRoles("admin"),
  userController.listDonors,
);
router.get(
  "/donors/search",
  protect,
  authorizeRoles("receiver", "admin"),
  userController.searchDonors,
);
router.get(
  "/donors/available",
  protect,
  authorizeRoles("receiver", "admin"),
  userController.getAvailableDonors,
);

router.get(
  "/donor/requests",
  protect,
  authorizeRoles("donor"),
  requestController.getDonorFeed,
);
router.get(
  "/donor-feed",
  protect,
  authorizeRoles("donor"),
  requestController.getDonorFeed,
);
router.get(
  "/donor-requests",
  protect,
  authorizeRoles("donor"),
  requestController.getDonorFeed,
);
router.get(
  "/receiver-requests",
  protect,
  authorizeRoles("receiver"),
  userController.getReceiverRequests,
);

router.put(
  "/donors/availability",
  protect,
  authorizeRoles("donor"),
  async (req, res, next) => {
    try {
      const availabilityStatus =
        req.body.availabilityStatus ?? req.body.isAvailable;
      req.user.availabilityStatus =
        availabilityStatus === true || availabilityStatus === "true";
      await req.user.save();

      res.status(200).json({
        success: true,
        message: "Availability updated successfully.",
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
