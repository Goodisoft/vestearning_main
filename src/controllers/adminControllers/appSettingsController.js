/**
 * @description Controller for handling application settings
 */
const appSettingsService = require("../../services/appSettingsService");
const { errorHandler } = require("../../utils/errorHandler");

class AppSettingsController {
  /**
   * @description Get application settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSettings(req, res) {
    try {
      const settings = await appSettingsService.getSettings();      
      res.status(200).json({
        status: "success",
        data: settings,
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  /**
   * @description Update application settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSettings(req, res) {
    try {
      const userId = req.user._id;
      const settings = await appSettingsService.updateSettings(
        req.body,
        userId
      );
      res.status(200).json({
        status: "success",
        message: "Application settings updated successfully",
        data: settings,
      });
    } catch (error) {
      errorHandler(res, error);
    }
  }

  /**
   * @description Update referral system settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateReferralSettings(req, res) {
    try {
      const userId = req.user._id;
      const settings = await appSettingsService.updateReferralSettings(
        req.body,
        userId
      );
      res.status(200).json({
        status: "success",
        message: "Referral settings updated successfully",
        data: settings,
      });
    } catch (error) {
      errorHandler(res, error);
    }
  }

  /**
   * @description Upload site logo
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      const userId = req.user._id;
      const settings = await appSettingsService.uploadLogo(req.file, userId);
      res.status(200).json({
        status: "success",
        message: "Logo uploaded successfully",
        data: {
          logo: settings.siteLogo,
        },
      });
    } catch (error) {
      errorHandler(res, error);
    }
  }

  /**
   * @description Upload site favicon
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadFavicon(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      const userId = req.user._id;
      const settings = await appSettingsService.uploadFavicon(req.file, userId);
      res.status(200).json({
        status: "success",
        message: "Favicon uploaded successfully",
        data: {
          favicon: settings.siteFavicon,
        },
      });
    } catch (error) {
      errorHandler(res, error);
    }
  }

  /**
   * @description Upload generic site image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadSiteImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      const imageType = req.params.type;
      const userId = req.user._id;

      // Check if the image type is valid
      if (!imageType) {
        return res.status(400).json({
          status: "error",
          message: "Image type not specified",
        });
      }

      // Update the appropriate field in settings based on the image type
      const updateData = {};
      updateData[imageType] = req.body[imageType]; // The path is already set by the middleware

      const settings = await appSettingsService.updateSettings(
        updateData,
        userId
      );

      res.status(200).json({
        status: "success",
        message: `${imageType} image uploaded successfully`,
        data: {
          [imageType]: req.body[imageType],
        },
      });
    } catch (error) {
      errorHandler(res, error);
    }
  }

  /**
   * @description Render application settings page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async renderSettings(req, res) {
    try {
      const settings = await appSettingsService.getSettings();      
      res.render("adminViews/application_settings", {
        title: "Application Settings",
        settings: settings,
        user: req.user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error", { error });
    }
  }
}

module.exports = new AppSettingsController();
