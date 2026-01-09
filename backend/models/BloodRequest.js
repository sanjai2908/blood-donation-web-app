// =============================================
// BLOOD REQUEST MODEL - MongoDB Schema
// =============================================
// This file defines the structure of blood requests in MongoDB
// When a receiver requests blood, this data is stored

const mongoose = require("mongoose");

// Define the Blood Request Schema
const bloodRequestSchema = new mongoose.Schema({
  // ID of the receiver who made the request
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },

  // Name of the receiver
  receiverName: {
    type: String,
    required: true,
  },

  // Email of the receiver
  receiverEmail: {
    type: String,
    required: true,
  },

  // Phone number of the receiver
  receiverPhone: {
    type: String,
    required: true,
  },

  // Blood group needed
  bloodGroupNeeded: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },

  // City where blood is needed
  city: {
    type: String,
    required: true,
    trim: true,
  },

  // Status of the request
  status: {
    type: String,
    enum: ["pending", "fulfilled", "cancelled"],
    default: "pending",
  },

  // Timestamp when request was made
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the BloodRequest model
module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
