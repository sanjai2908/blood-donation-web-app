const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const connectDB = require("./config/db");

async function resetAdminPassword() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment to reset an admin password.",
    );
    process.exit(1);
  }

  // In production require explicit confirmation to run this script
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ADMIN_RESET_CONFIRM !== "yes"
  ) {
    console.error(
      "❌ Refusing to reset admin password in production without ADMIN_RESET_CONFIRM=yes.",
    );
    process.exit(1);
  }

  await connectDB();

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error("❌ No user found with the provided ADMIN_EMAIL.");
      await mongoose.connection.close();
      process.exit(1);
    }

    user.password = password;
    await user.save();

    console.log("✅ Admin password reset successfully.");
    console.log(`Email: ${email}`);
    console.log("Password: (from environment)");
  } catch (err) {
    console.error("❌ Error resetting admin password:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
}

resetAdminPassword().catch(async (err) => {
  console.error("❌ Reset script failed:", err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
