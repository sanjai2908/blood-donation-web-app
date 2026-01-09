const mongoose = require("mongoose");
const User = require("./models/User");

const MONGODB_URI = "mongodb://localhost:27017/blood-donation";

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find admin user
    const admin = await User.findOne({ email: "admin@gmail.com" });

    if (!admin) {
      console.log("❌ Admin user NOT found!");
      console.log("\nCreating admin user now...");

      // Create admin user
      const newAdmin = new User({
        name: "Administrator",
        email: "admin@gmail.com",
        password: "admin@123",
        role: "admin",
        phone: "1234567890",
        city: "Delhi",
      });

      await newAdmin.save();
      console.log("✅ Admin user created successfully!");
      console.log("Email: admin@gmail.com");
      console.log("Password: admin@123");
    } else {
      console.log("✅ Admin user found!");
      console.log(`Email: ${admin.email}`);
      console.log(`Password in DB: ${admin.password}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Name: ${admin.name}`);
      console.log("\n🔐 Expected password: admin@123");
      if (admin.password === "admin@123") {
        console.log("✅ Password matches!");
      } else {
        console.log("❌ Password does NOT match!");
        console.log("Updating password to admin@123...");
        admin.password = "admin@123";
        await admin.save();
        console.log("✅ Password updated!");
      }
    }

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAdmin();
