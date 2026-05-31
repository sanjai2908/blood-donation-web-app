const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");
const requestRoutes = require("./routes/request");
const adminRoutes = require("./routes/admin");
const twoFactorRoutes = require("./routes/twoFactor");
const passwordRoutes = require("./routes/password");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.disable("x-powered-by");

// Configure CORS: allow configured client origins, or allow all in development.
const rawClientOrigin = process.env.CLIENT_ORIGIN;
let corsOrigin;
if (rawClientOrigin) {
  // split comma-separated list
  corsOrigin = rawClientOrigin.split(",").map((s) => s.trim());
  // when developing locally, allow the 'null' origin (file://) for quick testing
  if (process.env.NODE_ENV !== "production" && !corsOrigin.includes("null")) {
    corsOrigin.push("null");
  }
} else {
  corsOrigin = true; // allow all origins
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
// Development-only request logger to help debug CORS / routing issues.
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    try {
      console.log(
        `[DEV] ${new Date().toISOString()} ${req.method} ${req.originalUrl} Origin:${req.headers.origin}`,
      );
    } catch (e) {
      /* ignore logging errors */
    }
    next();
  });
}
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blood Donation API is running",
    version: "2.0.0",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Blood Donation API",
    version: "2.0.0",
    endpoints: {
      auth: [
        "POST /api/auth/register",
        "POST /api/auth/login",
        "GET /api/auth/me",
      ],
      donors: [
        "GET /api/donors/search",
        "GET /api/donors/available",
        "GET /api/donor/requests",
      ],
      requests: [
        "POST /api/requests",
        "GET /api/requests/me",
        "PUT /api/requests/:id/status",
      ],
      admin: [
        "GET /api/admin/dashboard",
        "GET /api/admin/users",
        "GET /api/admin/requests",
      ],
      twoFactor: [
        "POST /api/2fa/setup",
        "POST /api/2fa/verify",
        "POST /api/2fa/disable",
        "POST /api/2fa/recovery-login",
        "GET /api/2fa/recovery-codes",
        "POST /api/2fa/regenerate-codes",
      ],
    },
  });
});

app.use("/api", authRoutes);
app.use("/api", donorRoutes);
app.use("/api", requestRoutes);
app.use("/api", adminRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/api", passwordRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
