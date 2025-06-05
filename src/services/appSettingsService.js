/**
 * @description Service for app settings operations
 */
const appSettingsRepository = require("../repositories/appSettingsRepository");
const path = require("path");
const fs = require("fs").promises;

class AppSettingsService {
  /**
   * Get application settings
   * @returns {Promise<Object>} The application settings
   */
  async getSettings() {
    return await appSettingsRepository.getSettings();
  }

  /**
   * Update application settings
   * @param {Object} settingsData - The settings data to update
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(settingsData, userId) {
    try {
      return await appSettingsRepository.updateSettings(settingsData, userId);
    } catch (error) {
      console.error("Error updating application settings:", error);
      throw new Error("Failed to update application settings");
    }
  }

  /**
   * Update referral system settings
   * @param {Object} referralData - The referral settings data
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated referral settings
   */
  async updateReferralSettings(referralData, userId) {
    try {
      return await appSettingsRepository.updateReferralSettings(
        referralData,
        userId
      );
    } catch (error) {
      console.error("Error updating referral settings:", error);
      throw new Error("Failed to update referral settings");
    }
  }

  /**
   * Upload and update site logo
   * @param {Object} file - The uploaded file object
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async uploadLogo(file, userId) {
    try {
      // Save file to the uploads directory
      const uploadDir = path.join(process.cwd(), "public", "uploads", "site");

      // Create directory if it doesn't exist
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
      }

      // Update settings with new logo path
      const relativePath = `/uploads/site/${file.filename}`;
      return await appSettingsRepository.updateLogo(relativePath, userId);
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error("Failed to upload logo");
    }
  }

  /**
   * Upload and update site favicon
   * @param {Object} file - The uploaded file object
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async uploadFavicon(file, userId) {
    try {
      // Save file to the uploads directory
      const uploadDir = path.join(process.cwd(), "public", "uploads", "site");

      // Create directory if it doesn't exist
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
      }

      // Update settings with new favicon path
      const relativePath = `/uploads/site/${file.filename}`;
      return await appSettingsRepository.updateFavicon(relativePath, userId);
    } catch (error) {
      console.error("Error uploading favicon:", error);
      throw new Error("Failed to upload favicon");
    }
  }
}

module.exports = new AppSettingsService();
