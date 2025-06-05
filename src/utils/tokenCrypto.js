/**
 * @fileoverview Utility for encrypting and decrypting JWT tokens
 * This adds an extra layer of security for token transmission
 */

const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

// Secret key for encryption and decryption - should be in environment variables
const ENCRYPTION_KEY_HEX =
  process.env.TOKEN_ENCRYPTION_KEY ||
  "default-token-encryption-key-must-be-32-bytes";

// Convert hex string to buffer or ensure key is exactly 32 bytes
let ENCRYPTION_KEY;
if (ENCRYPTION_KEY_HEX.length === 64) {
  // If it's a valid 32-byte hex string (64 hex characters)
  ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex");
} else {
  // Otherwise, ensure it's 32 bytes by padding or truncating
  ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX.padEnd(32, "0").slice(0, 32));
}

const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypt a JWT token
 * @param {string} token - The JWT token to encrypt
 * @returns {string} - The encrypted token as a base64 string
 */
function encryptToken(token) {
  try {
    if (!token) {
      throw new Error("Token is required");
    }

    // Create an initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher using the encryption key and initialization vector
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

    // Encrypt the token
    let encrypted = cipher.update(token, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Combine the IV and encrypted token and return as base64
    return Buffer.from(iv.toString("hex") + ":" + encrypted).toString("base64");
  } catch (error) {
    console.error("Token encryption failed:", error);
    throw new Error(`Failed to encrypt token: ${error.message}`);
  }
}

/**
 * Decrypt an encrypted JWT token
 * @param {string} encryptedToken - The encrypted token (base64 string)
 * @returns {string} - The decrypted JWT token
 */
function decryptToken(encryptedToken) {
  try {
    if (!encryptedToken) {
      throw new Error("Encrypted token is required");
    }

    // Decode from base64
    const buffer = Buffer.from(encryptedToken, "base64").toString();

    // Split the initialization vector and encrypted token
    const parts = buffer.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted token format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

    // Decrypt the token
    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Token decryption failed:", error);
    throw new Error(`Failed to decrypt token: ${error.message}`);
  }
}

/**
 * Checks if a token is encrypted
 * @param {string} token - The token to check
 * @returns {boolean} - True if the token appears to be encrypted
 */
function isEncryptedToken(token) {
  try {
    if (!token) return false;

    // Try to decode it as base64
    const decoded = Buffer.from(token, "base64").toString();

    // Check if it has the correct format (iv:encryptedData)
    return decoded.includes(":");
  } catch (error) {
    return false;
  }
}

module.exports = {
  encryptToken,
  decryptToken,
  isEncryptedToken,
};
