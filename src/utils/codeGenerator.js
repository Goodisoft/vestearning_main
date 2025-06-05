/**
 * @fileoverview Utility for generating various codes and tokens
 */

const crypto = require("crypto");

/**
 * Generates a unique referral code
 * @param {number} length - Length of the code (default: 8)
 * @returns {string} - Unique referral code
 */
function generateReferralCode(length = 8) {
  // Generate a random alphanumeric string with specified length
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  // Add timestamp hash to ensure uniqueness
  const timestamp = Date.now().toString();
  const hash = crypto
    .createHash("md5")
    .update(timestamp)
    .digest("hex")
    .substring(0, 4);

  // Return a code with format XX-XXXXX-XX (e.g., AB-CDE12-3F)
  return `${code.substring(0, 2)}${code.substring(2, 7)}${hash.substring(
    0,
    2
  )}`.toUpperCase();
}

/**
 * Generates a random token
 * @param {number} size - Size of the token in bytes (default: 32)
 * @returns {string} - Random token in hex format
 */
function generateToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

module.exports = {
  generateReferralCode,
  generateToken,
};
