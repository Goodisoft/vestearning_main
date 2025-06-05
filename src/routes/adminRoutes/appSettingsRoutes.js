/**
 * @description Routes for application settings
 */
const express = require("express");
const appSettingsController = require("../../controllers/adminControllers/appSettingsController");
const authMiddleware = require("../../middlewares/authMiddleware");
const uploadMiddleware = require("../../middlewares/uploadMiddleware");
const router = express.Router();

// Middleware to check admin permissions
const checkAdminPermission = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Admin privileges required.",
    });
  }
};

// Apply auth middleware to all routes
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));
router.use(checkAdminPermission);

// Settings routes
router.get("/", appSettingsController.getSettings);
router.put("/", appSettingsController.updateSettings);
router.put("/referral", appSettingsController.updateReferralSettings);

// File upload routes
router.post(
  "/logo",
  uploadMiddleware.handleLogoUpload,
  appSettingsController.uploadLogo
);
router.post(
  "/favicon",
  uploadMiddleware.handleFaviconUpload,
  appSettingsController.uploadFavicon
);

// Additional site images route (for any future site images)
router.post(
  "/site-image/:type",
  (req, res, next) => {
    const imageType = req.params.type;
    uploadMiddleware.handleSiteImageUpload(imageType)(req, res, next);
  },
  appSettingsController.uploadSiteImage
);

module.exports = router;
