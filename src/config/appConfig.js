const dotenv = require("dotenv");

dotenv.config();

const config = {
  HOSTNAME: process.env.HOSTNAME || "localhost",
  PORT: process.env.PORT || "3000",
  BASE_URL: process.env.BASE_URL || `http://localhost:${PORT}`,
  MONGODB_URI:
    process.env.DATABASE_URL || "mongodb://localhost:27017/exnestrade",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET || "development_jwt_access_secret",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "development_jwt_refresh_secret",
  JWT_ACCESS_EXPIRES: "15m",
  JWT_REFRESH_EXPIRES: "7d",
  BCRYPT_SALT_ROUNDS: 12,
};

module.exports = config;
