const express = require("express");
const AdminController = require("../../controllers/adminControllers/adminController");
const AppSettingsController = require("../../controllers/adminControllers/appSettingsController");
const AdminOverviewController = require("../../controllers/adminControllers/adminOverviewController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Protected admin routes
router.use(protect, restrictTo("admin"));

// Page routes
router.get("/dashboard", AdminController.indexPage);
router.get("/users/active", AdminController.activeUsers);
router.get("/users/inactive", AdminController.inactiveUsers);
router.get("/users/suspended", AdminController.suspendedUsers);
router.get("/users/all", AdminController.allUsers);
router.get("/users/admin", AdminController.adminUsers);
router.get("/application-settings", AppSettingsController.renderSettings);

// API routes for dashboard overview
router.get(
  "/api/overview/statistics",
  AdminOverviewController.getSiteStatistics
);
router.get(
  "/api/overview/deposits",
  AdminOverviewController.getDepositStatistics
);
router.get(
  "/api/overview/withdrawals",
  AdminOverviewController.getWithdrawalStatistics
);
router.get(
  "/api/overview/investments",
  AdminOverviewController.getInvestmentOverview
);
router.get(
  "/api/overview/recent-investments",
  AdminOverviewController.getRecentInvestments
);
router.get(
  "/api/overview/top-plans",
  AdminOverviewController.getTopInvestedPlans
);
router.get(
  "/api/overview/recent-activities",
  AdminOverviewController.getRecentActivities
);

router.get(
  "/api/overview/wallet-balances",
  AdminOverviewController.getWalletBalances
);

// ========API routes for user management=========
router.get("/users/api", AdminController.getUsersApi);
// Users API route for dropdowns
router.get("/users/api/list", AdminController.getUsersListForDropdown);
router.get("/users/api/:id", AdminController.getUserDetailsApi);
router.patch(
  "/users/api/:id/withdrawal-limit",
  AdminController.updateWithdrawalLimitApi
);
router.patch("/users/api/:id/kyc-status", AdminController.updateKycStatusApi);
router.patch(
  "/users/api/:id/block-status",
  AdminController.toggleBlockStatusApi
);

// User information and wallet update endpoints
router.patch(
  "/users/api/:id/personal-info",
  AdminController.updateUserPersonalInfoApi
);
router.patch("/users/api/:id/wallet", AdminController.updateUserWalletApi);
router.post(
  "/users/api/:id/withdrawal-address",
  AdminController.updateWithdrawalAddressApi
);
router.delete(
  "/users/api/:id/withdrawal-address",
  AdminController.deleteWithdrawalAddressApi
);

// This dynamic route should come after the more specific routes
router.get(
  "/users/:id",
  protect,
  restrictTo("admin"),
  AdminController.userDetails
);

// Plan-related endpoints
router.get("/plans/api", AdminController.getPlansApi);

// Admin related endpoints to manage users
router.post("/users/api/send-email", AdminController.sendEmailApi);
router.post(
  "/users/api/send-plan-invitation",
  AdminController.sendPlanInvitationApi
);
router.post(
  "/users/api/block-status",
  AdminController.bulkToggleBlockStatusApi
);
router.patch(
  "/users/api/admin-status",
  AdminController.bulkToggleAdminStatusApi
);

module.exports = router;
