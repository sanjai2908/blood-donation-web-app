const mongoose = require("mongoose");
const User = require("./models/User");

const MONGODB_URI = "mongodb://localhost:27017/blood-donation";

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Delete existing admin user
    const deleted = await User.findOneAndDelete({ email: "admin@gmail.com" });
    if (deleted) {
      console.log("🗑️ Deleted existing admin user");
    }

    // Create fresh admin user with plain text password
    const newAdmin = new User({
      name: "Administrator",
      email: "admin@gmail.com",
      password: "admin@123", // Plain text as per the model
      role: "admin",
      phone: "1234567890",
      city: "Delhi",
    });

    await newAdmin.save();
    console.log("✅ New admin user created!");
    console.log("\n📋 Admin Credentials:");
    console.log("   Email: admin@gmail.com");
    console.log("   Password: admin@123");
    console.log("   Role: admin");
    console.log("\n✨ You can now login with these credentials!");

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetAdmin();
