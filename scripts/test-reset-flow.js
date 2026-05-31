// End-to-end test for password reset flow (OTP path).
// Usage: node scripts/test-reset-flow.js <email> <newPassword>

const http = require("http");
const qs = require("querystring");
const speakeasy = require("speakeasy");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });

const User = require("../backend/models/User");

function postJson(path, body) {
  const data = JSON.stringify(body);
  const opts = {
    hostname: "localhost",
    port: process.env.PORT || 5000,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(b);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: b });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || "anbu@gmail.com";
  const newPassword = args[1] || "NewPass123!";

  console.log(
    "Connecting to MongoDB",
    process.env.MONGODB_URI || "using default",
  );
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blood-donation",
  );

  const user = await User.findOne({ email }).select(
    "+twoFactorSecret +twoFactorEnabled",
  );
  if (!user) {
    console.error("User not found:", email);
    process.exit(2);
  }
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    console.error("User does not have 2FA enabled:", email);
    process.exit(3);
  }

  const otp = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: "base32",
  });
  console.log("Generated OTP for user", email, otp);

  // Step 1: forgot-password
  const fp = await postJson("/api/auth/forgot-password", { email });
  console.log("forgot-password response", fp.status, fp.body);
  const resetToken = fp.body && fp.body.resetToken;
  if (!resetToken) {
    console.error("No resetToken returned; aborting");
    process.exit(4);
  }

  // Step 2: verify OTP
  const vr = await postJson("/api/auth/verify-reset-otp", { resetToken, otp });
  console.log("verify-reset-otp response", vr.status, vr.body);
  const allowToken = vr.body && vr.body.allowToken;
  if (!allowToken) {
    console.error("No allowToken returned; aborting");
    process.exit(5);
  }

  // Step 3: reset password
  const rp = await postJson("/api/auth/reset-password", {
    allowToken,
    password: newPassword,
    confirm: newPassword,
  });
  console.log("reset-password response", rp.status, rp.body);

  await mongoose.disconnect();
  console.log("Test complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
