const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const createBloodRequest = asyncHandler(async (req, res) => {
  const { bloodGroupNeeded, city, requiredDate, message, receiverPhone } =
    req.body;

  if (!bloodGroupNeeded || !city) {
    throw new AppError("Blood group and city are required.", 400);
  }

  const request = await BloodRequest.create({
    receiverId: req.user._id,
    receiverName: req.user.name,
    receiverEmail: req.user.email,
    receiverPhone: receiverPhone || req.user.phone,
    bloodGroupNeeded,
    city,
    requiredDate: requiredDate || null,
    message: message || "",
  });

  const matchingDonors = await User.find({
    role: "donor",
    bloodGroup: bloodGroupNeeded,
    city: new RegExp(city, "i"),
    availabilityStatus: true,
  }).select("name email phone bloodGroup city availabilityStatus");

  res.status(201).json({
    success: true,
    message: "Blood request created successfully.",
    request,
    matchingDonors,
  });
});

const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find()
    .sort({ createdAt: -1 })
    .populate("receiverId", "name email phone city")
    .populate("assignedDonorId", "name email phone bloodGroup city");

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

const getRequestHistory = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ receiverId: req.user._id })
    .sort({ createdAt: -1 })
    .populate(
      "assignedDonorId",
      "name email phone bloodGroup city availabilityStatus",
    );

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const request = await BloodRequest.findById(req.params.id);

  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  if (req.user.role === "donor") {
    request.donorResponses.push({
      donorId: req.user._id,
      decision: status === "accepted" ? "accepted" : "rejected",
    });

    if (status === "accepted") {
      request.status = "accepted";
      request.assignedDonorId = req.user._id;
      await User.findByIdAndUpdate(req.user._id, { availabilityStatus: false });
    }
  } else if (req.user.role === "admin") {
    const allowedAdminStatuses = [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled",
    ];
    if (!allowedAdminStatuses.includes(status)) {
      throw new AppError("Invalid request status.", 400);
    }
    request.status = status;
  } else if (
    req.user.role === "receiver" &&
    request.receiverId.toString() === req.user._id.toString()
  ) {
    const allowedReceiverStatuses = ["cancelled", "completed"];
    if (!allowedReceiverStatuses.includes(status)) {
      throw new AppError(
        "Receivers can only cancel or complete their own requests.",
        400,
      );
    }
    request.status = status;
  } else {
    throw new AppError("You are not allowed to update this request.", 403);
  }

  if (note) {
    request.message =
      `${request.message ? `${request.message}\n` : ""}${note}`.trim();
  }

  await request.save();

  res.status(200).json({
    success: true,
    message: "Request updated successfully.",
    request,
  });
});

const getDonorFeed = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({
    bloodGroupNeeded: req.user.bloodGroup,
    city: new RegExp(req.user.city, "i"),
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .populate("receiverId", "name email phone city");

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

module.exports = {
  createBloodRequest,
  getAllRequests,
  getRequestHistory,
  updateRequestStatus,
  getDonorFeed,
};
