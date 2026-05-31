const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blood-donation";

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);

  return mongoUri;
}

module.exports = connectDB;
