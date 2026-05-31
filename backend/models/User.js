const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  role: {
    type: String,
    required: true,
    enum: ["donor", "receiver", "admin"],
    default: "receiver",
  },

  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    default: "",
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  city: {
    type: String,
    required: true,
    trim: true,
  },

  availabilityStatus: {
    type: Boolean,
    default: false,
  },

  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },

  twoFactorSecret: {
    type: String,
    select: false,
    default: "",
  },

  recoveryCodes: {
    type: [String],
    select: false,
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.recoveryCodes;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
