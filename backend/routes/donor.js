// =============================================
// DONOR ROUTES
// =============================================
// This file handles donor-related operations
// Routes: GET /donors, GET /donor/:id

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// =============================================
// ROUTE 1: GET ALL DONORS
// GET /donors
// =============================================
// This route fetches all registered donors
// Can filter by blood group and city (query parameters)
router.get("/donors", async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { bloodGroup, city } = req.query;

    // Build filter object
    let filter = { role: "donor" }; // Only get donors

    // Add blood group filter if provided
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    // Add city filter if provided
    if (city) {
      filter.city = new RegExp(city, "i"); // Case-insensitive search
    }

    // Fetch donors from database
    const donors = await User.find(filter)
      .select("-password") // Exclude password from results
      .sort({ createdAt: -1 }); // Sort by newest first

    // Send response
    res.status(200).json({
      success: true,
      count: donors.length,
      donors: donors,
    });
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donors",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 2: GET AVAILABLE DONORS
// GET /donors/available
// =============================================
// This route fetches only available donors for blood matching
router.get("/donors/available", async (req, res) => {
  try {
    // Extract blood group and city from query
    const { bloodGroup, city } = req.query;

    // Validation
    if (!bloodGroup || !city) {
      return res.status(400).json({
        success: false,
        message: "Blood group and city are required",
      });
    }

    // Build filter for available donors
    const filter = {
      role: "donor",
      bloodGroup: bloodGroup,
      city: new RegExp(city, "i"), // Case-insensitive
      isAvailable: true, // Only available donors
    };

    // Fetch matching donors
    const donors = await User.find(filter)
      .select("name email phone bloodGroup city age")
      .sort({ name: 1 });

    // Send response
    res.status(200).json({
      success: true,
      count: donors.length,
      donors: donors,
    });
  } catch (error) {
    console.error("Error fetching available donors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available donors",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 3: GET DONOR BY ID
// GET /donor/:id
// =============================================
router.get("/donor/:id", async (req, res) => {
  try {
    // Get donor ID from URL parameter
    const donorId = req.params.id;

    // Find donor in database
    const donor = await User.findById(donorId).select("-password");

    // Check if donor exists
    if (!donor || donor.role !== "donor") {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    // Send response
    res.status(200).json({
      success: true,
      donor: donor,
    });
  } catch (error) {
    console.error("Error fetching donor:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donor",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 4: UPDATE DONOR AVAILABILITY
// PUT /donor/:id/availability
// =============================================
router.put("/donor/:id/availability", async (req, res) => {
  try {
    const donorId = req.params.id;
    const { isAvailable } = req.body;

    // Validation
    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide availability status",
      });
    }

    // Update donor availability
    const donor = await User.findByIdAndUpdate(
      donorId,
      { isAvailable: isAvailable },
      { new: true }
    ).select("-password");

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      donor: donor,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 5: UPDATE DONOR (ADMIN)
// PUT /donor/:id
// =============================================
router.put("/donor/:id", async (req, res) => {
  try {
    const donorId = req.params.id;
    const { name, email, phone, city, age, bloodGroup, isAvailable } = req.body;

    // Build update object with provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (age !== undefined) updateData.age = age;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    // Update donor in database
    const donor = await User.findByIdAndUpdate(donorId, updateData, {
      new: true,
    }).select("-password");

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donor updated successfully",
      donor: donor,
    });
  } catch (error) {
    console.error("Error updating donor:", error);
    res.status(500).json({
      success: false,
      message: "Error updating donor",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 6: DELETE DONOR (ADMIN)
// DELETE /donor/:id
// =============================================
router.delete("/donor/:id", async (req, res) => {
  try {
    const donorId = req.params.id;

    // Delete donor from database
    const donor = await User.findByIdAndDelete(donorId);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donor deleted successfully",
      donor: donor,
    });
  } catch (error) {
    console.error("Error deleting donor:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting donor",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 7: GET DONOR NOTIFICATIONS
// GET /api/donor-notifications/:donorId
// =============================================
// This route fetches all matching blood requests for a donor
// Used to show notifications in donor dashboard

router.get("/donor-notifications/:donorId", async (req, res) => {
  try {
    // Get donor ID from URL parameter
    const donorId = req.params.donorId;

    // Find the donor to get their blood group, city, and availability
    const donor = await User.findById(donorId);

    // Check if donor exists
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    // Check if user is actually a donor
    if (donor.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can view notifications",
      });
    }

    // Fetch matching blood requests where:
    // - Blood group matches exactly
    // - City matches (case-insensitive)
    // - Status is "pending"
    // - Donor's availability is true
    const BloodRequest = require("../models/BloodRequest");

    const matchingRequests = await BloodRequest.find({
      bloodGroupNeeded: donor.bloodGroup, // Match blood group
      city: new RegExp(donor.city, "i"), // Match city (case-insensitive)
      status: "pending", // Only pending requests
    })
      .select("bloodGroupNeeded city receiverPhone receiverName createdAt")
      .sort({ createdAt: -1 }); // Newest first

    // Check if donor is available
    if (!donor.isAvailable) {
      return res.status(200).json({
        success: true,
        message: "Donor is not available",
        notifications: [],
      });
    }

    // Send response with matching requests
    res.status(200).json({
      success: true,
      count: matchingRequests.length,
      notifications: matchingRequests,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
});

// Export the router
module.exports = router;
