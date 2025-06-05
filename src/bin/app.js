const app = require("../../server.js");
const config = require("../config/appConfig.js");
const connectDB = require("../config/database/mongodb.js");

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start server after successful database connection
    app.listen(config.PORT, () => {
      console.log(`Server started on port: ${config.PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log(`URL: ${config.BASE_URL}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database. Server not started.", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
