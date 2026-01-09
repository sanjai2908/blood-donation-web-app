// =============================================
// AUTHENTICATION ROUTES
// =============================================
// This file handles user registration and login
// Routes: /register and /login

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// =============================================
// ROUTE 1: REGISTER NEW USER
// POST /register
// =============================================
router.post("/register", async (req, res) => {
  try {
    // Extract data from request body
    const {
      name,
      email,
      password,
      role,
      bloodGroup,
      age,
      phone,
      city,
      isAvailable,
    } = req.body;

    // Validation: Check if all required fields are present
    if (!name || !email || !password || !role || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user object
    const newUser = new User({
      name,
      email,
      password, // In production, hash the password using bcrypt
      role,
      phone,
      city,
    });

    // Add additional fields for donors
    if (role === "donor") {
      if (!bloodGroup || !age) {
        return res.status(400).json({
          success: false,
          message: "Blood group and age are required for donors",
        });
      }
      newUser.bloodGroup = bloodGroup;
      newUser.age = age;
      newUser.isAvailable = isAvailable !== undefined ? isAvailable : true;
    }

    // Save user to database
    await newUser.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// =============================================
// ROUTE 2: LOGIN USER
// POST /login
// =============================================
router.post("/login", async (req, res) => {
  try {
    // Extract email and password from request
    const { email, password } = req.body;

    // Validation: Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user in database
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if password matches (simple comparison)
    // In production, use bcrypt.compare()
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Login successful - send user data
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        bloodGroup: user.bloodGroup || "",
        age: user.age || 0,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
});

// Export the router
module.exports = router;
