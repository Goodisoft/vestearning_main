/**
 * @description Repository for app settings operations
 */
const AppSettings = require("../models/appSettingsModel");
const BaseRepository = require("./baseRepository");

class AppSettingsRepository extends BaseRepository {
  constructor() {
    super(AppSettings);
  }

  /**
   * Get the application settings (singleton)
   * @returns {Promise<Object>} The application settings
   */
  async getSettings() {
    return await AppSettings.getSettings();
  }

  /**
   * Update application settings
   * @param {Object} settingsData - The settings data to update
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(settingsData, userId) {
    const settings = await this.getSettings();

    // Update only the fields that are provided
    Object.keys(settingsData).forEach((key) => {
      if (
        key !== "_id" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "referralSystem"
      ) {
        settings[key] = settingsData[key];
      }
    });

    // Update updatedBy
    settings.updatedBy = userId;

    return await settings.save();
  }

  /**
   * Update referral system settings
   * @param {Object} referralData - The referral settings data
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async updateReferralSettings(referralData, userId) {
    const settings = await this.getSettings();

    // Update referral system settings
    if (referralData.enabled !== undefined) {
      settings.referralSystem.enabled = referralData.enabled;
    }

    if (referralData.levels && Array.isArray(referralData.levels)) {
      settings.referralSystem.levels = referralData.levels;
    }

    // Update updatedBy
    settings.updatedBy = userId;

    return await settings.save();
  }

  /**
   * Update site logo
   * @param {String} logoPath - Path to the uploaded logo
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async updateLogo(logoPath, userId) {
    const settings = await this.getSettings();

    settings.siteLogo = logoPath;
    settings.updatedBy = userId;

    return await settings.save();
  }

  /**
   * Update site favicon
   * @param {String} faviconPath - Path to the uploaded favicon
   * @param {String} userId - ID of the user making the update
   * @returns {Promise<Object>} Updated settings
   */
  async updateFavicon(faviconPath, userId) {
    const settings = await this.getSettings();

    settings.siteFavicon = faviconPath;
    settings.updatedBy = userId;

    return await settings.save();
  }
}

module.exports = new AppSettingsRepository();
