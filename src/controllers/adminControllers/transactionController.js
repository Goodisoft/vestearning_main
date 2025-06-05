/**
 * @fileoverview Controller for transaction operations (admin)
 */

const transactionService = require("../../services/transactionService");
const adminTransactionService = require("../../services/adminTransactionService");
const { validationResult } = require("express-validator");

class TransactionController {
  /**
   * Display deposit page
   */
  static async depositList(req, res) {
    return res.render("adminViews/deposit");
  }

  /**
   * Display withdrawal page
   */
  static async withdrawalList(req, res) {
    try {
      // Get pending withdrawals with pagination
      const result = await adminTransactionService.getPendingWithdrawals({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return res.render("adminViews/withdraw", {
        title: "Pending Withdrawals",
        withdrawals: result.withdrawals || [],
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error loading pending withdrawals:", error);
      req.flash(
        "error",
        "An error occurred while loading pending withdrawals."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  /**
   * Display pending transactions page
   */
  static async pendingTransactionList(req, res) {
    try {
      // Get pending investments with pagination
      const result = await adminTransactionService.getPendingInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return res.render("adminViews/pending_transactions", {
        title: "Pending Transactions",
        investments: result.investments || [],
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error loading pending investments:", error);
      req.flash(
        "error",
        "An error occurred while loading pending investments."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  /**
   * Display confirmed transactions page
   */
  static async confirmedTransactionList(req, res) {
    try {
      // Get active investments with pagination
      const result = await adminTransactionService.getActiveInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return res.render("adminViews/confirm_transactions", {
        title: "Confirmed Transactions",
        investments: result.investments || [],
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error loading confirmed investments:", error);
      req.flash(
        "error",
        "An error occurred while loading confirmed investments."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  /**
   * Display refund transactions page
   */
  static async refundTransactionList(req, res) {
    return res.render("adminViews/refund_transaction");
  }

  /**
   * Display deposit history page
   */
  static async depositHistory(req, res) {
    try {
      // Get all investments with pagination
      const result = await adminTransactionService.getAllInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return res.render("adminViews/deposit_history", {
        title: "Deposit History",
        investments: result.investments || [],
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error fetching deposits:", error);
      req.flash(
        "error",
        "An error occurred while fetching deposit investments."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  /**
   * Display withdrawal history page
   */
  static async withdrawalHistory(req, res) {
    try {
      // Get all withdrawals with pagination
      const result = await adminTransactionService.getAllWithdrawals({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return res.render("adminViews/withdrawal_history", {
        title: "Withdrawal History",
        withdrawals: result.withdrawals || [],
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      req.flash(
        "error",
        "An error occurred while fetching withdrawal history."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  /**
   * Display reinvestment history page
   */
  static async reinvestmentHistory(req, res) {
    return res.render("adminViews/reinvestment_history");
  }

  /**
   * Get pending transactions with pagination and filtering
   */
  static async pendingTransactions(req, res) {
    try {
      // Get pending investments with filtering and pagination
      const result = await adminTransactionService.getPendingInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId,
        planId: req.query.planId,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching pending investments:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching pending investments.",
      });
    }
  }

  /**
   * Get pending withdrawals with pagination and filtering
   */
  static async pendingWithdrawals(req, res) {
    try {
      // Get pending withdrawals with filtering and pagination
      const result = await adminTransactionService.getPendingWithdrawals({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId,
        type: req.query.type,
        currency: req.query.currency,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching pending withdrawals.",
      });
    }
  }

  /**
   * Get active transactions with pagination and filtering
   */
  static async activeTransactions(req, res) {
    try {
      // Get active investments with filtering and pagination
      const result = await adminTransactionService.getActiveInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId,
        planId: req.query.planId,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching active investments:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching active investments.",
      });
    }
  }

  /**
   * Get all withdrawals with pagination and filtering
   */
  static async allWithdrawals(req, res) {
    try {
      // Get all withdrawals with filtering and pagination
      const result = await adminTransactionService.getAllWithdrawals({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId,
        type: req.query.type,
        status: req.query.status,
        currency: req.query.currency,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching withdrawals.",
      });
    }
  }

  /**
   * Get investment details by ID
   */
  static async getInvestmentDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await adminTransactionService.getInvestmentById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching investment details:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching investment details.",
      });
    }
  }

  /**
   * Get withdrawal details by ID
   */
  static async getWithdrawalDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await adminTransactionService.getWithdrawalById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching withdrawal details:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching withdrawal details.",
      });
    }
  }

  /**
   * Update investment details
   */
  static async updateInvestmentDetails(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        earningRate: req.body.earningRate
          ? parseFloat(req.body.earningRate) / 100
          : undefined,
        duration: req.body.duration ? parseInt(req.body.duration) : undefined,
        durationUnit: req.body.durationUnit,
      };

      const result = await adminTransactionService.updateInvestmentDetails(
        id,
        updateData
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error updating investment details:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating investment details.",
      });
    }
  }

  /**
   * Confirm an investment
   */
  static async confirmInvestment(req, res) {
    try {
      const { id } = req.params;
      const result = await adminTransactionService.confirmInvestment(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error confirming investment:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while confirming the investment.",
      });
    }
  }

  /**
   * Approve a withdrawal request
   */
  static async approveWithdrawal(req, res) {
    try {
      const { id } = req.params;
      const { txHash } = req.body;

      const result = await adminTransactionService.approveWithdrawal(
        id,
        txHash
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while approving the withdrawal.",
      });
    }
  }

  /**
   * Cancel an investment
   */
  static async cancelInvestment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await adminTransactionService.cancelInvestment(id, reason);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error cancelling investment:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while cancelling the investment.",
      });
    }
  }

  /**
   * Cancel a withdrawal request
   */
  static async cancelWithdrawal(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await adminTransactionService.cancelWithdrawal(id, reason);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error cancelling withdrawal:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while cancelling the withdrawal.",
      });
    }
  }

  /**
   * Get investment statistics
   */
  static async getInvestmentStatistics(req, res) {
    try {
      const result = await adminTransactionService.getInvestmentStatistics();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching investment statistics:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching investment statistics.",
      });
    }
  }

  /**
   * Process a transaction (approve, reject, cancel)
   */
  static async processTransaction(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { transactionId } = req.params;
      const { action, txHash } = req.body;

      // Process the transaction
      const result = await transactionService.processTransaction(
        transactionId,
        action,
        { txHash }
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error processing transaction:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the transaction.",
      });
    }
  }

  /**
   * Create a manual deposit transaction (admin only)
   */
  static async createManualDeposit(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { userId, amount, walletAddress } = req.body;

      // Create the deposit
      const depositResult = await transactionService.createDepositRequest(
        userId,
        amount,
        walletAddress
      );

      if (!depositResult.success) {
        return res.status(400).json(depositResult);
      }

      // Automatically approve the manual deposit
      const approvalResult = await transactionService.processTransaction(
        depositResult.transaction._id,
        "approve",
        { txHash: req.body.txHash || "MANUAL-ADMIN-" + Date.now() }
      );

      return res.status(201).json(approvalResult);
    } catch (error) {
      console.error("Error creating manual deposit:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the manual deposit.",
      });
    }
  }
}

module.exports = TransactionController;
