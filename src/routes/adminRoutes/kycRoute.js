const express = require("express");
const KycController = require("../../controllers/adminControllers/kycController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Protected admin routes
router.use(protect, restrictTo("admin"));

// KYC applications page with pagination (supports both applications and users view)
router.get("/applications", KycController.showKycPage);

// Get specific KYC application details by ID
router.get("/applications/:id", KycController.getKycDetails);

// Update KYC status (approve, reject)
router.put("/applications/:id/status", KycController.updateKycStatus);

// Get KYC settings
router.get("/settings", KycController.getKycSettings);

// Update KYC settings
router.put("/settings", KycController.updateKycSettings);

module.exports = router;
