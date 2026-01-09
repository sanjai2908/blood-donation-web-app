// =============================================
// CREATE ADMIN USER SCRIPT
// =============================================
// Run this script to create an admin user in MongoDB

const mongoose = require("mongoose");
require("dotenv").config();

// Import User model
const User = require("./models/User");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blood-donation";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: "admin@gmail.com" });

      if (existingAdmin) {
        console.log("⚠️  Admin user already exists!");
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Role: ${existingAdmin.role}`);
        process.exit(0);
      }

      // Create new admin user
      const adminUser = new User({
        name: "Administrator",
        email: "admin@gmail.com",
        password: "admin@123", // Store plain text (as per your app design)
        role: "admin",
        phone: "9876543210",
        city: "Delhi",
        isAvailable: true,
      });

      // Save admin user
      await adminUser.save();

      console.log("✅ Admin user created successfully!");
      console.log("");
      console.log("📝 Admin Credentials:");
      console.log("   Email: admin@gmail.com");
      console.log("   Password: admin@123");
      console.log("");
      console.log("You can now login to the admin dashboard!");

      process.exit(0);
    } catch (error) {
      console.error("❌ Error creating admin user:", error.message);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });
