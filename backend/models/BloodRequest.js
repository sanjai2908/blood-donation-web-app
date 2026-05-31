const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },

  receiverName: {
    type: String,
    required: true,
    trim: true,
  },

  receiverEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  receiverPhone: {
    type: String,
    required: true,
    trim: true,
  },

  bloodGroupNeeded: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },

  city: {
    type: String,
    required: true,
    trim: true,
  },

  requiredDate: {
    type: Date,
  },

  message: {
    type: String,
    trim: true,
    default: "",
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },

  assignedDonorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  donorResponses: [
    {
      donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      decision: {
        type: String,
        enum: ["accepted", "rejected"],
        required: true,
      },
      respondedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bloodRequestSchema.pre("save", function updateTimestamp() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
