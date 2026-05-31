const User = require("../models/User");
const BloodRequest = require("../models/BloodRequest");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalDonors,
    totalReceivers,
    totalBloodRequests,
    availableDonors,
    recentRequests,
  ] = await Promise.all([
    User.countDocuments({ role: "donor" }),
    User.countDocuments({ role: "receiver" }),
    BloodRequest.countDocuments(),
    User.countDocuments({ role: "donor", availabilityStatus: true }),
    BloodRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("receiverId", "name email phone city")
      .populate("assignedDonorId", "name email phone city"),
  ]);

  res.status(200).json({
    success: true,
    dashboard: {
      totalDonors,
      totalReceivers,
      totalBloodRequests,
      availableDonors,
      recentRequests,
    },
  });
});

const getRecentRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("receiverId", "name email phone city")
    .populate("assignedDonorId", "name email phone city");

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const editableFields = [
    "name",
    "phone",
    "city",
    "role",
    "bloodGroup",
    "availabilityStatus",
    "password",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (user.role !== "donor") {
    user.bloodGroup = "";
    user.availabilityStatus = false;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    user,
  });
});

module.exports = {
  getDashboard,
  getRecentRequests,
  updateUser,
};
