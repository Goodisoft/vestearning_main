const express = require("express");
const ReferralController = require("../../controllers/adminControllers/referralController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect, restrictTo("admin"));

// Frontend page routes
router.get("/referral-earning-history", ReferralController.referralEarningList);

// API routes
router.get("/api/earnings", ReferralController.getReferralEarnings);
router.get("/api/tree/:userId", ReferralController.getReferralTree);
router.get("/api/statistics", ReferralController.getReferralStatistics);
router.put(
  "/api/requirement/:userId",
  ReferralController.updateReferralNeeded
);

// User listing and search API routes for referral management
router.get("/api/users", ReferralController.getUsersList);
router.get("/api/users/search", ReferralController.searchUsers);


module.exports = router;
