/**
 * @fileoverview MongoDB database connection
 */

const mongoose = require("mongoose");
const config = require("../appConfig");

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {

    await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB connected successfully");

    // Log any errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
