const planService = require("../services/planService");
const transactionService = require("../services/transactionService");
const userService = require("../services/userService");
const Investment = require("../models/investmentModel");
const notificationService = require("../services/notificationService");
const walletService = require("../services/walletService");
const Withdrawal = require("../models/withdrawalModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");

const { validationResult } = require("express-validator");

class UserController {
  static async dashboard(req, res) {
    try {
      // Get user's active investments, recent transactions, and account stats
      const userId = req.user._id;
      // Get user's active investments
      const activeInvestments = await Investment.find({
        userId: userId,
        status: "active",
      }).populate("planId");

      // Calculate investment stats
      const investmentStats = {
        totalInvested: 0,
        activeInvestments: activeInvestments.length,
        totalEarnings: 0,
      };

      // Calculate total invested and earnings
      activeInvestments.forEach((investment) => {
        investmentStats.totalInvested += investment.amount;

        // Calculate expected earnings based on the duration and rate
        if (investment.startDate && investment.endDate) {
          const now = new Date();
          const start = new Date(investment.startDate);

          // If investment has started, calculate current earnings
          if (start <= now) {
            const end = new Date(investment.endDate);

            const totalDuration = end - start;
            let elapsedDuration = now - start;

            // Ensure we don't exceed the total duration
            if (elapsedDuration > totalDuration) {
              elapsedDuration = totalDuration;
            }

            const progressPercent = elapsedDuration / totalDuration;
            const expectedEarning = investment.amount * investment.earningRate;
            const currentEarning = expectedEarning * progressPercent;

            investmentStats.totalEarnings += currentEarning;
          }
        }
      });

      // Get user's recent transactions
      const recentTransactions = await transactionService.getUserTransactions(
        userId,
        { limit: 5 }
      );

      // Get user data
      const userData = await userService.getUserById(userId);

      if (!userData.success) {
        return res.status(400).json(userData);
      }
      // Get wallet balance
      const walletData = await walletService.getUserWallet(userId);

      // Get available investment plans
      const availablePlans = await planService.getAllPlans({ active: true });

      // Check for user notifications
      const userNotifications =
        await notificationService.getNotificationWithLimit(userId, 2);

      return res.render("userViews/index", {
        title: "Dashboard",
        user: userData.user,
        walletData: walletData.wallet,
        stats: investmentStats,
        activeInvestments: activeInvestments,
        baseUrl: process.env.BASE_URL,
        transactions: recentTransactions.success
          ? recentTransactions.transactions
          : [],
        plans: availablePlans.success ? availablePlans.plans : [],
        notifications: userNotifications.success
          ? userNotifications.notifications
          : [],
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while loading the dashboard.",
      });
    }
  }

  static async transactions(req, res) {
    try {
      const userId = req.user._id;

      // Get user's transactions with pagination
      const result = await transactionService.getUserTransactions(userId, {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        type: req.query.type, // Filter by transaction type if provided
        status: req.query.status, // Filter by transaction status if provided
      });

      if (!result.success) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json(result);
        }
        req.flash("error", result.message);
        return res.redirect("/user");
      }

      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(200).json(result);
      }

      return res.render("userViews/transactions", {
        title: "My Transactions",
        transactions: result.transactions,
        pagination: result.pagination,
        filters: {
          type: req.query.type || "all",
          status: req.query.status || "all",
        },
      });
    } catch (error) {
      console.error("Error loading transactions:", error);
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(500).json({
          success: false,
          message: "An error occurred while loading transactions.",
        });
      }
      req.flash("error", "An error occurred while loading transactions.");
      return res.redirect("/user");
    }
  }

  static async getUserTransactionById(req, res) {
    try {
      const userId = req.user._id;
      const txtId = req.params.id;

      // Get user's investment details
      const result = await transactionService.getTransactionById(txtId);

      if (!result.success) {
        throw new Error("Investment doe not exist");
      }

      return res.json({
        success: true,
        transaction: result.transaction,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async investmentPlans(req, res) {
    try {
      // Get all active investment plans
      const result = await planService.getAllPlans({ active: true });

      if (!result.success) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json(result);
        }
        req.flash("error", result.message);
        return res.redirect("/user/dashboard");
      }

      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(200).json(result);
      }

      // Get user data for wallet balance
      const userId = req.user._id;
      const userData = await userService.getUserById(userId);

      return res.render("userViews/plans", {
        title: "Investment Plans",
        plans: result.plans,
        user: userData.success ? userData.user : {},
      });
    } catch (error) {
      console.error("Error loading investment plans:", error);
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(500).json({
          success: false,
          message: "An error occurred while loading investment plans.",
        });
      }
      req.flash("error", "An error occurred while loading investment plans.");
      return res.redirect("/user");
    }
  }

  static async profile(req, res) {
    try {
      const userId = req.user._id;

      // Get user profile data
      const result = await userService.getUserById(userId);

      if (!result.success) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json(result);
        }
        req.flash("error", result.message);
        return res.redirect("/user");
      }

      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(200).json({
          success: true,
          user: result.user,
        });
      }

      return res.render("userViews/profile", {
        title: "My Profile",
        user: result.user,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(500).json({
          success: false,
          message: "An error occurred while loading profile data.",
        });
      }
      req.flash("error", "An error occurred while loading profile data.");
      return res.redirect("/user");
    }
  }

  /**
   * Create a new investment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createInvestment(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const { planId, amount, currencyId, txHash } = req.body;

      // Create the investment
      const result = await transactionService.createInvestment(
        userId,
        planId,
        amount,
        currencyId,
        txHash
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating investment:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the investment.",
      });
    }
  }

  /**
   * Get user's investments
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserInvestments(req, res) {
    try {
      const userId = req.user._id;

      // Get user's investments with optional filters
      const result = await transactionService.getUserInvestments(userId, {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status, // Filter by status if provided
      });

      if (!result.success) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json(result);
        }
        req.flash("error", result.message);
        return res.redirect("/user/dashboard");
      }

      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(200).json(result);
      }

      return res.render("userViews/investments", {
        title: "My Investments",
        investments: result.investments,
        pagination: result.pagination,
        filters: {
          status: req.query.status || "all",
        },
      });
    } catch (error) {
      console.error("Error loading investments:", error);
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(500).json({
          success: false,
          message: "An error occurred while loading investments.",
        });
      }
      req.flash("error", "An error occurred while loading investments.");
      return res.redirect("/user");
    }
  }

  /**
   * Create a deposit request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createDeposit(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const { amount, walletAddress } = req.body;

      // Create the deposit request
      const result = await transactionService.createDepositRequest(
        userId,
        amount,
        walletAddress
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating deposit request:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the deposit request.",
      });
    }
  }

  /**
   * Create a withdrawal request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createWithdrawal(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const { amount, walletAddress } = req.body;

      // Create the withdrawal request
      const result = await transactionService.createWithdrawalRequest(
        userId,
        amount,
        walletAddress
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the withdrawal request.",
      });
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateProfile(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const updateData = req.body;

      // Update the profile
      const result = await userService.updateProfile(userId, updateData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the profile.",
      });
    }
  }

  /**
   * Submit KYC information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async submitKyc(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;

      // Handle the req.files structure properly
      const documents = [];

      if (req.files) {
        // Iterate through each field (like utilityBill)
        Object.keys(req.files).forEach((fieldName) => {
          const files = req.files[fieldName];
          if (Array.isArray(files)) {
            // Add each file path to documents
            files.forEach((file) => {
              // documents.push(file.path);
              const relativePath = `/uploads/kyc/${userId}/${file.filename}`;
              documents.push(relativePath); // Use full relative path
            });
          }
        });
      }

      const kycData = {
        ...req.body,
        documents,
      };

      // Submit the KYC data
      const result = await userService.submitKyc(userId, kycData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while submitting KYC information.",
      });
    }
  }

  /**
   * Render withdrawal page for both wallet and referral withdrawals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async withdrawalPage(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      const wallet = await Wallet.findOne({ user: userId });

      if (!user || !wallet) {
        req.flash("error", "User or wallet not found");
        return res.redirect("/user");
      }

      // Get user's saved wallet addresses
      const savedWallets = wallet.withdrawalAddresses || [];

      // Get available currencies
      const currencies = [
        { symbol: "BTC", name: "Bitcoin" },
        { symbol: "ETH", name: "Ethereum" },
        { symbol: "USDT", name: "Tether" },
        // Add more currencies as needed
      ];

      // Count user's direct referrals
      const directReferrals = await User.countDocuments({ referredBy: userId });

      // Check if the user meets referral requirements for withdrawal
      const canWithdrawReferral =
        user.referralNeeded === 0 || directReferrals >= user.referralNeeded;

      return res.render("userViews/withdrawal", {
        title: "Withdraw Funds",
        user,
        wallet,
        savedWallets,
        currencies,
        directReferrals,
        referralNeeded: user.referralNeeded,
        canWithdrawReferral,
        walletBalance: wallet.walletBalance,
        referralBalance: wallet.referralBalance,
      });
    } catch (error) {
      console.error("Error loading withdrawal page:", error);
      req.flash("error", "An error occurred while loading the withdrawal page");
      return res.redirect("/user");
    }
  }

  /**
   * Process wallet withdrawal request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async processWalletWithdrawal(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const { amount, walletAddress, currency } = req.body;

      // Validate amount is a positive number
      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid withdrawal amount",
        });
      }

      // Get user and check KYC status
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check KYC status
      if (user.kycStatus == "pending" || user.kycStatus == "rejected") {
        return res.status(402).json({
          success: false,
          message: "KYC verification is required for withdrawals",
        });
      }

      // Get user wallet
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }

      // Check if wallet has sufficient balance
      if (wallet.walletBalance < withdrawalAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
      }

      // Count user's direct referrals
      const directReferralCount = await User.countDocuments({
        referredBy: userId,
      });
      console.log("Direct Referrals:", directReferralCount);

      // Check user referral requirements
      if (
        user.referralNeeded > 0 &&
        user.referralNeeded > directReferralCount
      ) {
        return res.status(403).json({
          success: false,
          message: `You need at least ${user.referralNeeded} direct referrals to withdraw.`,
        });
      }

      // Check withdrawal limit
      if (user.withdrawalLimit > 0 && withdrawalAmount > user.withdrawalLimit) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal limit exceeded. Maximum withdrawal amount is ${user.withdrawalLimit}$`,
        });
      }

      // Create withdrawal record
      const withdrawal = new Withdrawal({
        userId,
        type: "wallet",
        amount: withdrawalAmount,
        currency,
        walletAddress,
        status: "pending",
      });
      await withdrawal.save();

      // Deduct amount from wallet balance
      wallet.walletBalance -= withdrawalAmount;
      wallet.totalWithdrawal += withdrawalAmount;
      await wallet.save();

      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: "withdrawal",
        amount: withdrawalAmount,
        currency,
        status: "pending",
        walletAddress,
        description: `Withdrawal of ${withdrawalAmount} ${currency} from wallet`,
      });
      await transaction.save();

      // Send notification
      await notificationService.createTransactionNotification(
        userId,
        transaction
      );

      return res.status(200).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        withdrawal: {
          id: withdrawal._id,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          status: withdrawal.status,
        },
      });
    } catch (error) {
      console.error("Error processing wallet withdrawal:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing your withdrawal request",
      });
    }
  }

  /**
   * Process referral earnings withdrawal request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async processReferralWithdrawal(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const { amount, walletAddress, currency } = req.body;

      // Validate amount is a positive number
      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid withdrawal amount",
        });
      }

      // Get user and check KYC status
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check KYC status
      if (user.kycStatus == "pending" || user.kycStatus == "rejected") {
        return res.status(402).json({
          success: false,
          message: "KYC verification is required for withdrawals",
        });
      }

      // Get user wallet
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }

      // Check if wallet has sufficient referral balance
      if (wallet.referralBalance < withdrawalAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient referral balance",
        });
      }

      // Check referral requirements
      const directReferrals = await User.countDocuments({ referredBy: userId });

      if (user.referralNeeded > 0 && directReferrals < user.referralNeeded) {
        return res.status(403).json({
          success: false,
          message: `You need at least ${user.referralNeeded} direct referrals to withdraw referral earnings. You currently have ${directReferrals}.`,
        });
      }

      // Create withdrawal record
      const withdrawal = new Withdrawal({
        userId,
        type: "referral",
        amount: withdrawalAmount,
        currency,
        walletAddress,
        status: "pending",
      });
      await withdrawal.save();

      // Deduct amount from referral balance
      wallet.referralBalance -= withdrawalAmount;
      wallet.totalWithdrawal += withdrawalAmount;
      await wallet.save();

      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: "withdrawal",
        amount: withdrawalAmount,
        currency,
        status: "pending",
        walletAddress,
        description: `Withdrawal of ${withdrawalAmount} ${currency} from referral earnings`,
      });
      await transaction.save();

      // Send notification
      await notificationService.createTransactionNotification(
        userId,
        transaction
      );

      return res.status(200).json({
        success: true,
        message: "Referral earnings withdrawal request submitted successfully",
        withdrawal: {
          id: withdrawal._id,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          status: withdrawal.status,
        },
      });
    } catch (error) {
      console.error("Error processing referral withdrawal:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing your withdrawal request",
      });
    }
  }

  /**
   * Cancel a pending withdrawal request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async cancelWithdrawal(req, res) {
    try {
      const userId = req.user._id;
      const { withdrawalId } = req.params;

      // Find the withdrawal
      const withdrawal = await Withdrawal.findOne({
        _id: withdrawalId,
        userId,
        status: "pending",
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: "Pending withdrawal not found",
        });
      }

      // Get transaction associated with this withdrawal
      const transaction = await Transaction.findOne({
        userId,
        type: "withdrawal",
        status: "pending",
        amount: withdrawal.amount,
        walletAddress: withdrawal.walletAddress,
      });

      // Get user wallet
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }

      // Update withdrawal status
      withdrawal.status = "cancelled";
      withdrawal.reason = "Cancelled by user";
      await withdrawal.save();

      // Return the amount to the appropriate balance
      if (withdrawal.type === "wallet") {
        wallet.walletBalance += withdrawal.amount;
      } else {
        wallet.referralBalance += withdrawal.amount;
      }
      wallet.totalWithdrawal -= withdrawal.amount;
      await wallet.save();

      // Update transaction if it exists
      if (transaction) {
        transaction.status = "cancelled";
        await transaction.save();

        // Send notification
        await notificationService.createTransactionNotification(
          userId,
          transaction
        );
      }

      return res.status(200).json({
        success: true,
        message: "Withdrawal request cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling withdrawal:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while cancelling your withdrawal request",
      });
    }
  }

  /**
   * Add or update a wallet address for withdrawals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async saveWalletAddress(req, res) {
    try {
      const userId = req.user._id;
      const { address, currency, network, label } = req.body;

      // Basic validation
      if (!address || !currency) {
        return res.status(400).json({
          success: false,
          message: "Wallet address and currency are required",
        });
      }

      // Get user wallet
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }

      // Initialize withdrawalAddresses array if it doesn't exist
      if (!wallet.withdrawalAddresses) {
        wallet.withdrawalAddresses = [];
      }

      // Check if this currency already has an address
      const existingAddressIndex = wallet.withdrawalAddresses.findIndex(
        (w) => w.currency === currency
      );

      if (existingAddressIndex >= 0) {
        // Update existing address
        wallet.withdrawalAddresses[existingAddressIndex] = {
          currency,
          address,
          network: network || "Main",
          label: label || currency,
        };
      } else {
        // Add new address
        wallet.withdrawalAddresses.push({
          currency,
          address,
          network: network || "Main",
          label: label || currency,
        });
      }

      await wallet.save();

      return res.status(200).json({
        success: true,
        message: "Wallet address saved successfully",
        wallet: {
          withdrawalAddresses: wallet.withdrawalAddresses,
        },
      });
    } catch (error) {
      console.error("Error saving wallet address:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while saving your wallet address",
      });
    }
  }

  /**
   * Get user's withdrawal history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getWithdrawalHistory(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, type } = req.query;

      const query = { userId };

      // Filter by type if provided
      if (type && ["wallet", "referral"].includes(type)) {
        query.type = type;
      }

      // Get total count for pagination
      const total = await Withdrawal.countDocuments(query);

      // Get withdrawals with pagination
      const withdrawals = await Withdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .exec();

      return res.status(200).json({
        success: true,
        withdrawals,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching your withdrawal history",
      });
    }
  }

  /**
   * Get user's KYC status and details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getKycStatus(req, res) {
    try {
      const userId = req.user._id;

      // Get user's KYC status
      const user = await User.findById(userId, "kycStatus kycDocuments");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get KYC settings to know which documents are required
      const KycSettings = require("../models/kycSettingsModel");
      const kycSettings = await KycSettings.getSettings();

      return res.status(200).json({
        success: true,
        kycStatus: user.kycStatus,
        kycDocuments: user.kycDocuments || [],
        requiredDocuments: kycSettings.requiredDocuments,
        kycDescription: kycSettings.kycDescription,
        kycInstructions: kycSettings.kycInstructions,
      });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching your KYC status",
      });
    }
  }

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user._id;
      const { currentPassword, newPassword } = req.body;

      await userService.updatePassword(userId, currentPassword, newPassword);

      // Create a security notification for the password change
      await notificationService.createNotification(
        userId,
        "Password Changed",
        "Your account password was changed successfully.",
        "security"
      );

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while changing your password",
      });
    }
  }

  /**
   * Get user's notifications with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await notificationService.getUserNotifications(userId, {
        page,
        limit,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching your notifications",
      });
    }
  }

  /**
   * Mark a notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async markNotificationAsRead(req, res) {
    try {
      const userId = req.user._id;
      const notificationId = req.params.id;

      const result = await notificationService.markNotificationAsRead(
        userId,
        notificationId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the notification",
      });
    }
  }

  /**
   * Mark all notifications as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user._id;

      const result = await notificationService.markAllNotificationsAsRead(
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating your notifications",
      });
    }
  }

  /**
   * Get available investment plans via API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getInvestmentPlansApi(req, res) {
    try {
      // Get all active investment plans
      const result = await planService.getAllPlans({ active: true });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        plans: result.plans,
      });
    } catch (error) {
      console.error("Error loading investment plans:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while loading investment plans.",
      });
    }
  }

  /**
   * Process a reinvestment from wallet balance
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async reinvestWalletBalance(req, res) {
    try {
      const userId = req.user._id;
      const { planId, amount } = req.body;

      // Validate the request
      if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
        return res.status(400).json({
          success: false,
          message: "Valid plan ID is required",
        });
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid amount is required",
        });
      }

      // Check if the user has enough balance
      const walletData = await walletService.getUserWallet(userId);      

      if (!walletData.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to retrieve wallet data",
        });
      }

      if (walletData.walletBalance < amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance for this reinvestment",
        });
      }

      // Get the plan details
      const planResult = await planService.getPlanById(planId);

      if (!planResult.success) {
        return res.status(400).json({
          success: false,
          message: "Investment plan not found",
        });
      }

      const plan = planResult.plan;

      // Validate the amount against plan limits
      if (
        amount < plan.minAmount ||
        (plan.maxAmount && amount > plan.maxAmount)
      ) {
        return res.status(400).json({
          success: false,
          message: `Investment amount must be between $${plan.minAmount} and $${
            plan.maxAmount || "unlimited"
          }`,
        });
      }
      // Total roi percentage
      const expectedEarnings =
        ((amount * plan.roiPercentage) / 100) * plan.term;
      // Create an investment directly with 'active' status (similar to confirmInvestment)
      const investment = new Investment({
        userId,
        planId,
        amount,
        status: "active", // Set as active immediately since we're confirming it directly
        startDate: new Date(),
        earningRate: plan.roiPercentage / 100,
        expectedEarning: expectedEarnings,
        duration: plan.term,
        durationUnit: plan.termPeriod,
        type: "reinvestment", // Mark as a reinvestment
      });

      // Calculate end date based on the plan's term and period
      let endDate = new Date(investment.startDate);
      switch (plan.termPeriod) {
        case "hours":
          endDate.setHours(endDate.getHours() + plan.term);
          break;
        case "days":
          endDate.setDate(endDate.getDate() + plan.term);
          break;
        case "weeks":
          endDate.setDate(endDate.getDate() + plan.term * 7);
          break;
        case "months":
          endDate.setMonth(endDate.getMonth() + plan.term);
          break;
        case "years":
          endDate.setFullYear(endDate.getFullYear() + plan.term);
          break;
        default:
          endDate.setDate(endDate.getDate() + plan.term);
      }
      investment.endDate = endDate;

      // Save the investment
      await investment.save();

      // Deduct the amount from the user's wallet
      await Wallet.findOneAndUpdate(
        { user: userId },
        { $inc: { walletBalance: -amount } }
      );

      // Create a transaction record
      const transaction = new Transaction({
        userId,
        planId,
        type: "reinvestment",
        amount,
        currency: "USD",
        status: "completed",
        description: `Reinvestment in ${plan.name} plan`,
      });

      await transaction.save();

      // Create a notification for the user
      await notificationService.createNotification({
        userId,
        title: "Reinvestment Successful",
        message: `You have successfully reinvested $${amount} into the ${plan.name} plan.`,
        type: "investment",
      });

      return res.status(200).json({
        success: true,
        message: "Reinvestment processed successfully",
        investment: {
          id: investment._id,
          amount,
          planName: plan.name,
          startDate: investment.startDate,
          endDate: investment.endDate,
        },
      });
    } catch (error) {
      console.error("Error processing reinvestment:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing your reinvestment",
      });
    }
  }
}

module.exports = UserController;
