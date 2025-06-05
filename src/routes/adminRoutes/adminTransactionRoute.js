const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const adminTransactionController = require("../../controllers/adminControllers/adminTransactionController");


router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

// Admin transaction dashboard routes
router.get(
  "/dashboard",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getTransactionDashboard
);
router.get(
  "/deposits",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getDeposits
);
router.get(
  "/deposit/:id",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getDepositById
);
router.post(
  "/deposit/:id/approve",
  isAuthenticated,
  isAdmin,
  adminTransactionController.approveDeposit
);
router.post(
  "/deposit/:id/cancel",
  isAuthenticated,
  isAdmin,
  adminTransactionController.cancelDeposit
);

// Admin withdrawal management routes
router.get(
  "/withdraw",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getPendingWithdrawals
);
router.get(
  "/withdrawal-history",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getWithdrawalHistory
);
router.get(
  "/withdrawal/:id",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getWithdrawalById
);
router.post(
  "/api/withdrawals/:id/approve",
  isAuthenticated,
  isAdmin,
  adminTransactionController.approveWithdrawal
);
router.post(
  "/api/withdrawals/:id/cancel",
  isAuthenticated,
  isAdmin,
  adminTransactionController.cancelWithdrawal
);
router.get(
  "/api/withdrawals/:id",
  isAuthenticated,
  isAdmin,
  adminTransactionController.getWithdrawalDetailsById
);

// Export router
module.exports = router;
