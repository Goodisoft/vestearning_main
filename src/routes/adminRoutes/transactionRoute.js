const express = require("express");
const router = express.Router();
const TransactionController = require("../../controllers/adminControllers/transactionController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");
const {
  processTransactionValidation,
  manualDepositValidation,
} = require("../../middlewares/transactionValidationMiddleware");

// View routes
router.get(
  "/deposit",
  protect,
  restrictTo("admin"),
  TransactionController.depositList
);
router.get(
  "/withdraw",
  protect,
  restrictTo("admin"),
  TransactionController.withdrawalList
);
router.get(
  "/pending",
  protect,
  restrictTo("admin"),
  TransactionController.pendingTransactionList
);
router.get(
  "/confirmed",
  protect,
  restrictTo("admin"),
  TransactionController.confirmedTransactionList
);
router.get(
  "/refund",
  protect,
  restrictTo("admin"),
  TransactionController.refundTransactionList
);

// History routes
router.get(
  "/deposit-history",
  protect,
  restrictTo("admin"),
  TransactionController.depositHistory
);
router.get(
  "/withdrawal-history",
  protect,
  restrictTo("admin"),
  TransactionController.withdrawalHistory
);
router.get(
  "/reinvestment-history",
  protect,
  restrictTo("admin"),
  TransactionController.reinvestmentHistory
);

// API routes for transaction management
router.get(
  "/api/pending",
  protect,
  restrictTo("admin"),
  TransactionController.pendingTransactions
);
router.get(
  "/api/active",
  protect,
  restrictTo("admin"),
  TransactionController.activeTransactions
);
router.get(
  "/api/statistics",
  protect,
  restrictTo("admin"),
  TransactionController.getInvestmentStatistics
);
router.post(
  "/api/process/:transactionId",
  protect,
  restrictTo("admin"),
  processTransactionValidation,
  TransactionController.processTransaction
);
router.post(
  "/api/manual-deposit",
  protect,
  restrictTo("admin"),
  manualDepositValidation,
  TransactionController.createManualDeposit
);

// Investment management endpoints
router.get(
  "/api/investments/:id",
  protect,
  restrictTo("admin"),
  TransactionController.getInvestmentDetails
);
router.put(
  "/api/investments/:id",
  protect,
  restrictTo("admin"),
  TransactionController.updateInvestmentDetails
);
router.post(
  "/api/investments/:id/confirm",
  protect,
  restrictTo("admin"),
  TransactionController.confirmInvestment
);
router.post(
  "/api/investments/:id/cancel",
  protect,
  restrictTo("admin"),
  TransactionController.cancelInvestment
);

// Withdrawal management endpoints
router.get(
  "/api/withdrawals/pending",
  protect,
  restrictTo("admin"),
  TransactionController.pendingWithdrawals
);
router.get(
  "/api/withdrawals/all",
  protect,
  restrictTo("admin"),
  TransactionController.allWithdrawals 
);
router.get(
  "/api/withdrawals/:id",
  protect,
  restrictTo("admin"),
  TransactionController.getWithdrawalDetails
);
router.post(
  "/api/withdrawals/:id/approve",
  protect,
  restrictTo("admin"),
  TransactionController.approveWithdrawal
);
router.post(
  "/api/withdrawals/:id/cancel",
  protect,
  restrictTo("admin"),
  TransactionController.cancelWithdrawal
);

module.exports = router;
