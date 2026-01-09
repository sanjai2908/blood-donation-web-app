// =============================================
// BLOOD REQUEST ROUTES
// =============================================
// This file handles blood request operations
// Routes: POST /request-blood, GET /requests

const express = require("express");
const router = express.Router();
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");

// =============================================
// ROUTE 1: CREATE BLOOD REQUEST
// POST /request-blood
// =============================================
router.post("/request-blood", async (req, res) => {
  try {
    // Extract data from request body
    const {
      receiverId,
      receiverName,
      receiverEmail,
      receiverPhone,
      bloodGroupNeeded,
      city,
    } = req.body;

    // Validation: Check if all required fields are present
    if (
      !receiverId ||
      !receiverName ||
      !receiverEmail ||
      !receiverPhone ||
      !bloodGroupNeeded ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create new blood request
    const newRequest = new BloodRequest({
      receiverId,
      receiverName,
      receiverEmail,
      receiverPhone,
      bloodGroupNeeded,
      city,
      status: "pending",
    });

    // Save to database
    await newRequest.save();

    // Find matching donors
    const matchingDonors = await User.find({
      role: "donor",
      bloodGroup: bloodGroupNeeded,
      city: new RegExp(city, "i"),
      isAvailable: true,
    }).select("name email phone bloodGroup city");

    // Send success response with matching donors
    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request: newRequest,
      matchingDonors: matchingDonors,
      donorCount: matchingDonors.length,
    });
  } catch (error) {
    console.error("Error creating blood request:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blood request",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 2: GET ALL BLOOD REQUESTS
// GET /requests
// =============================================
router.get("/requests", async (req, res) => {
  try {
    // Fetch all blood requests from database
    const requests = await BloodRequest.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("receiverId", "name email"); // Populate receiver details

    // Send response
    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blood requests",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 3: GET REQUESTS BY RECEIVER ID
// GET /requests/receiver/:receiverId
// =============================================
router.get("/requests/receiver/:receiverId", async (req, res) => {
  try {
    const receiverId = req.params.receiverId;

    // Fetch requests for this receiver
    const requests = await BloodRequest.find({ receiverId: receiverId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests,
    });
  } catch (error) {
    console.error("Error fetching receiver requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching requests",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 4: UPDATE REQUEST STATUS
// PUT /request/:id
// =============================================
router.put("/request/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    // Update request status
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      requestId,
      { status: status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Request status updated",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({
      success: false,
      message: "Error updating request",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 5: DELETE BLOOD REQUEST (ADMIN)
// DELETE /request/:id
// =============================================
router.delete("/request/:id", async (req, res) => {
  try {
    const requestId = req.params.id;

    // Delete request from database
    const deletedRequest = await BloodRequest.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
      request: deletedRequest,
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting request",
      error: error.message,
    });
  }
});

// Export the router
module.exports = router;
