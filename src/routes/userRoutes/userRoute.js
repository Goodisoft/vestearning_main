const express = require("express");
const UserController = require("../../controllers/userController.js");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");
const {
  withdrawalValidation,
  saveWalletAddressValidation,
} = require("../../middlewares/transactionValidationMiddleware");
const {
  handleKycDocumentUpload,
} = require("../../middlewares/uploadMiddleware");
const { body, check } = require("express-validator");

const router = express.Router();

router.use(protect, restrictTo("user"));

// Dashboard and main routes
router.get("/dashboard", protect, UserController.dashboard);
router.get("/transactions", protect, UserController.transactions);
router.get("/investment-plans", protect, UserController.investmentPlans);
router.get(
  "/api/investment-plans",
  protect,
  UserController.getInvestmentPlansApi
);
router.post("/api/reinvest", protect, UserController.reinvestWalletBalance);

// Get user's transaction by ID
router.get(
  "/api/transactions/:id",
  protect,
  restrictTo("user"),
  UserController.getUserTransactionById
);

// Investment related routes
router.post(
  "/api/investments",
  protect,
  restrictTo("user"),
  [
    body("planId").isMongoId().withMessage("Valid plan ID is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be greater than 0"),
    body("currencyId").isMongoId().withMessage("Valid currency ID is required"),
    body("txHash")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Transaction hash is required"),
  ],
  UserController.createInvestment
);
// Get user's investments
router.get(
  "/investments",
  protect,
  restrictTo("user"),
  UserController.getUserInvestments
);

/**
 * Withdrawal routes
 */
router.get(
  "/withdrawal",
  protect,
  restrictTo("user"),
  UserController.withdrawalPage
);
router.post(
  "/api/wallet-withdrawal",
  protect,
  restrictTo("user"),
  withdrawalValidation,
  UserController.processWalletWithdrawal
);
router.post(
  "/api/referral-withdrawal",
  protect,
  restrictTo("user"),
  withdrawalValidation,
  UserController.processReferralWithdrawal
);
router.post(
  "/api/cancel-withdrawal/:withdrawalId",
  protect,
  restrictTo("user"),
  UserController.cancelWithdrawal
);
router.post(
  "/api/save-wallet-address",
  protect,
  restrictTo("user"),
  saveWalletAddressValidation,
  UserController.saveWalletAddress
);
router.get(
  "/api/withdrawal-history",
  protect,
  restrictTo("user"),
  UserController.getWithdrawalHistory
);

// ============Profile routes=======
router.get("/profile", protect, restrictTo("user"), UserController.profile);

router.put(
  "/profile/update",
  protect,
  restrictTo("user"),
  [
    check("fullName", "Full name is required").notEmpty().trim(),
    check("country", "Country is required").notEmpty().trim(),
  ],
  UserController.updateProfile
);

// Password change
router.post(
  "/password/change",
  protect,
  restrictTo("user"),
  [
    check("currentPassword", "Current password is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  UserController.changePassword
);

// KYC routes
router.get(
  "/kyc/status",
  protect,
  restrictTo("user"),
  UserController.getKycStatus
);
router.post(
  "/kyc/submit",
  protect,
  restrictTo("user"),
  handleKycDocumentUpload,
  UserController.submitKyc
);

// Notification routes
router.get(
  "/notifications",
  protect,
  restrictTo("user"),
  UserController.getUserNotifications
);
router.patch(
  "/notifications/:id/read",
  protect,
  restrictTo("user"),
  UserController.markNotificationAsRead
);
router.patch(
  "/notifications/read-all",
  protect,
  restrictTo("user"),
  UserController.markAllNotificationsAsRead
);

module.exports = router;
