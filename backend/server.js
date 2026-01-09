// =============================================
// MAIN SERVER FILE - Entry Point
// =============================================
// This is the main backend server file
// It sets up Express server and MongoDB connection

// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import route files
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");
const requestRoutes = require("./routes/request");

// Create Express app
const app = express();

// =============================================
// MIDDLEWARE SETUP
// =============================================

// Enable CORS - allows frontend to communicate with backend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// =============================================
// MONGODB CONNECTION
// =============================================

// MongoDB connection string
// Replace with your MongoDB URI or use environment variable
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blood-donation";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit if database connection fails
  });

// =============================================
// API ROUTES
// =============================================

// Test route - to check if server is running
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blood Donation API is running",
    version: "1.0.0",
  });
});

// Authentication routes (register, login)
app.use("/api", authRoutes);

// Donor routes (get donors, get donor by id)
app.use("/api", donorRoutes);

// Blood request routes (create request, get requests)
app.use("/api", requestRoutes);

// =============================================
// ERROR HANDLING
// =============================================

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// =============================================
// START SERVER
// =============================================

// Server port
const PORT = process.env.PORT || 5000;

// Start listening for requests
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

// =============================================
// EXPLANATIONS FOR VIVA:
// =============================================
/*
1. What is Express.js?
   - Express is a web framework for Node.js
   - It helps create REST APIs easily
   - It handles routing and middleware

2. What is Mongoose?
   - Mongoose is an ODM (Object Data Modeling) library
   - It provides schema-based solution for MongoDB
   - It simplifies database operations

3. What is CORS?
   - CORS = Cross-Origin Resource Sharing
   - Allows frontend (different port) to access backend
   - Required for frontend-backend communication

4. What is Middleware?
   - Functions that execute during request-response cycle
   - Used for parsing JSON, logging, authentication
   - Example: app.use(express.json())

5. Why use environment variables?
   - To store sensitive data (passwords, API keys)
   - Different configs for development/production
   - Keep secrets out of source code
*/
