const User = require("../models/User");
const BloodRequest = require("../models/BloodRequest");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const searchDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, city, availabilityStatus } = req.query;

  const filter = { role: "donor" };

  if (bloodGroup) {
    filter.bloodGroup = bloodGroup;
  }

  if (city) {
    filter.city = new RegExp(city, "i");
  }

  if (availabilityStatus !== undefined) {
    filter.availabilityStatus = availabilityStatus === "true";
  }

  const donors = await User.find(filter)
    .select("name email phone bloodGroup city availabilityStatus createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donors.length,
    donors,
  });
});

const listDonors = asyncHandler(async (req, res) => {
  const donors = await User.find({ role: "donor" })
    .select("name email phone bloodGroup city availabilityStatus createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donors.length,
    donors,
  });
});

const getAvailableDonors = asyncHandler(async (req, res) => {
  const donors = await User.find({ role: "donor", availabilityStatus: true })
    .select("name email phone bloodGroup city availabilityStatus")
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: donors.length,
    donors,
  });
});

const getReceiverRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ receiverId: req.user._id })
    .sort({ createdAt: -1 })
    .populate(
      "assignedDonorId",
      "name phone email bloodGroup city availabilityStatus",
    );

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(
      "name email phone bloodGroup city role availabilityStatus createdAt",
    )
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw new AppError("You cannot delete your own account.", 400);
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    throw new AppError("User not found.", 404);
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully.",
  });
});

module.exports = {
  searchDonors,
  listDonors,
  getAvailableDonors,
  getReceiverRequests,
  listUsers,
  deleteUser,
};
