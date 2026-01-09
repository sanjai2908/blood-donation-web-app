// =============================================
// USER MODEL - MongoDB Schema for Users
// =============================================
// This file defines the structure of user data in MongoDB
// It handles both Donor and Receiver user types

const mongoose = require("mongoose");

// Define the User Schema
const userSchema = new mongoose.Schema({
  // Full name of the user
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // Email address - used for login (must be unique)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Password - stored as plain text for simplicity (in production, use bcrypt)
  password: {
    type: String,
    required: true,
  },

  // User role: 'donor', 'receiver', or 'admin'
  role: {
    type: String,
    required: true,
    enum: ["donor", "receiver", "admin"],
    default: "donor",
  },

  // Blood group - only for donors
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    default: "",
  },

  // Age - only for donors
  age: {
    type: Number,
    min: 18,
    max: 65,
  },

  // Phone number
  phone: {
    type: String,
    required: true,
  },

  // City where user lives
  city: {
    type: String,
    required: true,
    trim: true,
  },

  // Availability status - only for donors (true = available to donate)
  isAvailable: {
    type: Boolean,
    default: true,
  },

  // Timestamp when user registered
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the User model
module.exports = mongoose.model("User", userSchema);
