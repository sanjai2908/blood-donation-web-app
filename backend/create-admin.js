const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const connectDB = require("./config/db");

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const allowCreate =
    process.env.ALLOW_ADMIN_CREATE === "true" ||
    process.env.NODE_ENV !== "production";

  if (!email || !password) {
    console.error(
      "❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment.",
    );
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production" && !allowCreate) {
    console.error(
      "❌ Refusing to create admin in production. Set ALLOW_ADMIN_CREATE=true to override.",
    );
    process.exit(1);
  }

  await connectDB();

  try {
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists for the given email.");
      await mongoose.connection.close();
      return;
    }

    const adminUser = await User.create({
      name: "Administrator",
      email,
      password,
      role: "admin",
      phone: "0000000000",
      city: "",
      bloodGroup: "",
      availabilityStatus: false,
    });

    console.log("✅ Admin user created successfully.");
    console.log(`Email: ${adminUser.email}`);
    console.log("Password: (from environment)");
  } catch (err) {
    console.error("❌ Error creating admin user:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

createAdmin().catch(async (error) => {
  console.error("❌ Error creating admin user:", error.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
