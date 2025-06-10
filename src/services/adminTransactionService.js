/**
 * @fileoverview Admin Transaction service for handling admin-specific transaction operations
 */

const Investment = require("../models/investmentModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const AppSettings = require("../models/appSettingsModel");
const emailService = require("../utils/emailService");
const userRepository = require("../repositories/userRepository");
const walletRepository = require("../repositories/walletRepository");
const transactionRepository = require("../repositories/transactionRepository");
const Wallet = require("../models/walletModel");
const Withdrawal = require("../models/withdrawalModel");
const planService = require("./planService");
const notificationService = require("./notificationService");
const {sendEmail} = require("../utils/emailService");
const mongoose = require("mongoose");

/**
 * Get all investments with pagination and filtering options
 * @param {Object} options - Query options (page, limit, status, userId, etc)
 * @returns {Promise<Object>} Paginated investments with user and plan details
 */
async function getAllInvestments(options = {}) {
  try {
    // Create query based on filters
    let query = Investment.find();

    // Apply status filter if provided
    if (options.status) {
      query = query.find({ status: options.status });
    }

    // Apply user filter if provided
    if (options.userId) {
      query = query.find({ userId: options.userId });
    }

    // Apply plan filter if provided
    if (options.planId) {
      query = query.find({ planId: options.planId });
    }

    // Apply date range filter if provided
    if (options.startDate && options.endDate) {
      query = query.find({
        createdAt: {
          $gte: new Date(options.startDate),
          $lte: new Date(options.endDate),
        },
      });
    }

    // Count total matching documents for pagination
    const total = await Investment.countDocuments(query);

    // Apply pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // Apply sorting
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Execute query with pagination and populate related fields
    const investments = await query
      .populate("userId", "fullName email walletBalance")
      .populate(
        "planId",
        "name minAmount maxAmount roiPercentage term termPeriod"
      )
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .exec();

    return {
      success: true,
      investments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching investments:", error);
    return {
      success: false,
      message: `Failed to fetch investments: ${error.message}`,
    };
  }
}

/**
 * Get pending investments with pagination and filtering options
 * @param {Object} options - Query options (page, limit, userId, etc)
 * @returns {Promise<Object>} Paginated pending investments with user and plan details
 */
async function getPendingInvestments(options = {}) {
  return getAllInvestments({
    ...options,
    status: "pending",
  });
}

/**
 * Get active investments with pagination and filtering options
 * @param {Object} options - Query options (page, limit, userId, etc)
 * @returns {Promise<Object>} Paginated active investments with user and plan details
 */
async function getActiveInvestments(options = {}) {
  return getAllInvestments({
    ...options,
    status: "active",
  });
}

/**
 * Get completed investments with pagination and filtering options
 * @param {Object} options - Query options (page, limit, userId, etc)
 * @returns {Promise<Object>} Paginated completed investments with user and plan details
 */
async function getCompletedInvestments(options = {}) {
  return getAllInvestments({
    ...options,
    status: "completed",
  });
}

/**
 * Get investment by ID with populated user and plan details
 * @param {string} investmentId - The ID of the investment
 * @returns {Promise<Object>} Investment details
 */
async function getInvestmentById(investmentId) {
  try {
    const investment = await Investment.findById(investmentId)
      .populate("userId", "fullName email walletBalance referredBy")
      .populate(
        "planId",
        "name minAmount maxAmount roiPercentage term termPeriod"
      )
      .exec();

    if (!investment) {
      return {
        success: false,
        message: "Investment not found",
      };
    }

    // Get related transaction
    const transaction = await Transaction.findOne({
      planId: investment.planId,
      userId: investment.userId,
      status: "pending",
      type: "deposit",
    }).exec();

    return {
      success: true,
      investment,
      transaction,
    };
  } catch (error) {
    console.error("Error fetching investment:", error);
    return {
      success: false,
      message: `Failed to fetch investment: ${error.message}`,
    };
  }
}

/**
 * Update investment details before confirmation
 * @param {string} investmentId - The ID of the investment
 * @param {Object} updateData - Data to update (amount, earningRate, duration, etc)
 * @returns {Promise<Object>} Updated investment details
 */
async function updateInvestmentDetails(investmentId, updateData) {
  try {
    // Find the investment
    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return {
        success: false,
        message: "Investment not found",
      };
    }

    // Only allow updating pending investments
    if (investment.status !== "pending") {
      return {
        success: false,
        message: `Cannot update an investment that is already ${investment.status}`,
      };
    }

    // Only allow specific fields to be updated
    const allowedFields = ["amount", "earningRate", "duration", "durationUnit"];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Update the investment
    const updatedInvestment = await Investment.findByIdAndUpdate(
      investmentId,
      filteredData,
      { new: true }
    )
      .populate("userId", "fullName email walletBalance referredBy")
      .populate(
        "planId",
        "name minAmount maxAmount roiPercentage term termPeriod"
      );

    // If amount was updated, update the related transaction as well
    if (updateData.amount !== undefined && updatedInvestment) {
      await Transaction.findOneAndUpdate(
        {
          planId: updatedInvestment.planId,
          userId: updatedInvestment.userId,
          status: "pending",
          type: "deposit",
        },
        { amount: updateData.amount },
        { new: true }
      );
    }

    return {
      success: true,
      investment: updatedInvestment,
      message: "Investment details updated successfully",
    };
  } catch (error) {
    console.error("Error updating investment:", error);
    return {
      success: false,
      message: `Failed to update investment: ${error.message}`,
    };
  }
}

/**
 * Calculate end date based on start date, duration, and duration unit
 * @param {Date} startDate - The start date of the investment
 * @param {number} duration - The duration value
 * @param {string} durationUnit - The duration unit (hour, day, week, month)
 * @returns {Date} The calculated end date
 */
function calculateEndDate(startDate, duration, durationUnit) {
  const date = new Date(startDate);

  switch (durationUnit) {
    case "hour":
      date.setHours(date.getHours() + duration);
      break;
    case "day":
      date.setDate(date.getDate() + duration);
      break;
    case "week":
      date.setDate(date.getDate() + duration * 7);
      break;
    case "month":
      date.setMonth(date.getMonth() + duration);
      break;
    default:
      date.setDate(date.getDate() + duration); // Default to days
  }

  return date;
}

/**
 * Process referral rewards for investment confirmation
 * @param {Object} user - The user object with referredBy field
 * @param {number} investmentAmount - The investment amount
 * @returns {Promise<void>}
 */
async function processReferralRewards(user, investmentAmount) {
  try {
    // Get app settings for referral configuration
    const appSettings = await AppSettings.getSettings();

    // Check if referral system is enabled
    if (!appSettings.referralSystem || !appSettings.referralSystem.enabled) {
      console.log("Referral system is disabled");
      return;
    }

    // Get referral levels configuration
    const levels = appSettings.referralSystem.levels || [];
    if (!levels.length) {
      console.log("No referral levels configured");
      return;
    }

    // Process referrals for up to 3 levels
    let currentReferrerId = user.referredBy;
    let currentLevel = 1;

    while (currentReferrerId && currentLevel <= Math.min(3, levels.length)) {
      // Find the referrer user
      // const referrer = await userRepository.findByReferralCode(
      //   currentReferrerId
      // );
      const referrer = await userRepository.findById(currentReferrerId);

      if (!referrer) break;

      // Find the level configuration
      const levelConfig = levels.find((l) => l.level === currentLevel);
      if (!levelConfig) break;

      // Calculate commission
      const commissionRate = levelConfig.commissionRate / 100; // Convert percentage to decimal
      const commissionAmount = investmentAmount * commissionRate;

      if (commissionAmount <= 0) continue;

      // Create transaction record for the commission
      await transactionRepository.create({
        userId: referrer._id,
        type: "referral",
        amount: commissionAmount,
        currency: "USD", // Using USD as standard currency for commissions
        status: "completed",
        description: `Level ${currentLevel} referral commission from ${user.fullName}'s investment`,
      });

      // Update referrer wallet balance
      const w = await walletRepository.updateReferralBalance(
        referrer._id,
        commissionAmount
      );

      // Send email notification
      await sendReferralCommissionEmail(
        referrer,
        user,
        commissionAmount,
        currentLevel,
        levelConfig.commissionRate
      );

      // Move to next level up the chain
      currentReferrerId = referrer.referredBy;
      currentLevel++;
    }
  } catch (error) {
    console.error("Error processing referral rewards:", error);
  }
}

/**
 * Send email notification about referral commission
 * @param {Object} referrer - The referrer user object
 * @param {Object} investor - The investor user object
 * @param {number} commissionAmount - The commission amount
 * @param {number} level - The referral level
 * @param {number} commissionRate - The commission percentage
 * @returns {Promise<void>}
 */
async function sendReferralCommissionEmail(
  referrer,
  investor,
  commissionAmount,
  level,
  commissionRate
) {
  const subject = `Referral Commission Earned - EXNES${process.env.SITE_NAME}TRADE`;
  const link = "/auth/login";
  const buttonText = "View Transaction";
  const message = `
    <h2>Congratulations on Your Referral Reward!</h2>
    <p>Dear ${referrer.fullName},</p>
    <p>You have earned a referral commission from your level ${level} referral's investment.</p>
    <h3>Commission Details:</h3>
    <ul>
      <li><strong>Amount Earned:</strong> $${commissionAmount.toFixed(2)}</li>
      <li><strong>Commission Rate:</strong> ${commissionRate}%</li>
      <li><strong>Referral Level:</strong> ${level}</li>
      <li><strong>Referral:</strong> ${investor.fullName}</li>
    </ul>
    <p>The commission has been added to your account balance.</p>
    <p>Thank you for being a valued member of ${process.env.SITE_NAME}.</p>
  `;

  try {
    await emailService.sendEmail(
      referrer.email,
      subject,
      message,
      link,
      buttonText
    );
  } catch (error) {
    console.error("Error sending referral commission email:", error);
  }
}

/**
 * Send investment confirmation email to user
 * @param {Object} user - The user object
 * @param {Object} investment - The investment object with populated planId
 * @returns {Promise<void>}
 */
async function sendInvestmentConfirmationEmail(user, investment) {
  const subject = `Investment Confirmed - ${process.env.SITE_NAME}`;
  const link = "/auth/login";
  const buttonText = "View Transaction";

  const planName = investment.planId
    ? investment.planId.name
    : "Investment Plan";

  const message = `
    <h2>Investment Confirmation</h2>
    <p>Dear ${user.fullName},</p>
    <p>We are pleased to inform you that your investment has been confirmed and activated.</p>
    <h3>Investment Details:</h3>
    <ul>
      <li><strong>Plan:</strong> ${planName}</li>
      <li><strong>Amount:</strong> $${investment.amount.toFixed(2)}</li>
      <li><strong>ROI:</strong> ${(investment.earningRate * 100).toFixed(
        1
      )}%</li>
      <li><strong>Duration:</strong> ${investment.duration} ${
    investment.durationUnit
  }${investment.duration > 1 ? "s" : ""}</li>
      <li><strong>Start Date:</strong> ${new Date(
        investment.startDate
      ).toLocaleDateString()}</li>
      <li><strong>End Date:</strong> ${new Date(
        investment.endDate
      ).toLocaleDateString()}</li>
    </ul>
    <p>Your earnings will be processed according to the plan terms. You can monitor your investment performance in your dashboard.</p>
    <p>Thank you for investing with  ${process.env.SITE_NAME}.</p>
  `;

  try {
    await emailService.sendEmail(
      user.email,
      subject,
      message,
      link,
      buttonText
    );
  } catch (error) {
    console.error("Error sending investment confirmation email:", error);
  }
}

/**
 * Confirm a pending investment
 * @param {string} investmentId - The ID of the investment
 * @returns {Promise<Object>} Confirmed investment details
 */
async function confirmInvestment(investmentId) {
  try {
    // Find the investment with user and plan details
    const investment = await Investment.findById(investmentId)
      .populate("userId", "fullName email walletBalance referredBy")
      .populate(
        "planId",
        "name minAmount maxAmount roiPercentage term termPeriod"
      );

    if (!investment) {
      return {
        success: false,
        message: "Investment not found",
      };
    }

    // Only confirm pending investments
    if (investment.status !== "pending") {
      return {
        success: false,
        message: `Cannot confirm an investment that is already ${investment.status}`,
      };
    }

    // Find the related transaction
    const transaction = await Transaction.findOne({
      planId: investment.planId._id,
      userId: investment.userId._id,
      status: "pending",
      type: investment.type,
    });

    if (!transaction) {
      return {
        success: false,
        message: "Related transaction not found",
      };
    }

    // Set start date to current time
    const startDate = new Date();

    // Calculate end date based on duration and unit
    const endDate = calculateEndDate(
      startDate,
      investment.duration,
      investment.durationUnit
    );
    // Total roi percentage
    const expectedEarnings =
      investment.amount * investment.earningRate * investment.duration;

    // Update investment status and dates
    investment.status = "active";
    investment.startDate = startDate;
    investment.endDate = endDate;
    investment.expectedEarning = expectedEarnings;
    await investment.save();

    // Update transaction status to completed
    transaction.status = "completed";
    transaction.expectedEarning = expectedEarnings;
    await transaction.save();

    // Update total deposit in user's wallet
    await walletRepository.updateTotalDeposit(
      investment.userId._id,
      investment.amount
    );

    // Process referral rewards if applicable
    await processReferralRewards(investment.userId, investment.amount);

    // Send confirmation email to the user
    await sendInvestmentConfirmationEmail(investment.userId, investment);

    return {
      success: true,
      investment,
      message: "Investment confirmed successfully",
    };
  } catch (error) {
    console.error("Error confirming investment:", error);
    return {
      success: false,
      message: `Failed to confirm investment: ${error.message}`,
    };
  }
}

/**
 * Cancel a pending investment
 * @param {string} investmentId - The ID of the investment
 * @param {string} reason - The reason for cancellation
 * @returns {Promise<Object>} Cancelled investment details
 */
async function cancelInvestment(investmentId, reason = "") {
  try {
    // Find the investment with user and plan details
    const investment = await Investment.findById(investmentId)
      .populate("userId", "fullName email walletBalance")
      .populate("planId", "name");

    if (!investment) {
      return {
        success: false,
        message: "Investment not found",
      };
    }

    // Only cancel pending investments
    if (investment.status !== "pending") {
      return {
        success: false,
        message: `Cannot cancel an investment that is already ${investment.status}`,
      };
    }

    // Find the related transaction
    const transaction = await Transaction.findOne({
      planId: investment.planId._id,
      userId: investment.userId._id,
      status: "pending",
      type: "deposit",
    });

    // Update investment status
    investment.status = "cancelled";
    await investment.save();

    // Update transaction status to failed
    if (transaction) {
      transaction.status = "failed";
      transaction.description =
        transaction.description +
        " (Cancelled by admin" +
        (reason ? `: ${reason}` : "") +
        ")";
      await transaction.save();
    }

    // Send cancellation email to the user
    await sendInvestmentCancellationEmail(
      investment.userId,
      investment,
      reason
    );

    return {
      success: true,
      investment,
      message: "Investment cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling investment:", error);
    return {
      success: false,
      message: `Failed to cancel investment: ${error.message}`,
    };
  }
}

/**
 * Send investment cancellation email to user
 * @param {Object} user - The user object
 * @param {Object} investment - The investment object with populated planId
 * @param {string} reason - The reason for cancellation
 * @returns {Promise<void>}
 */
async function sendInvestmentCancellationEmail(user, investment, reason = "") {
  const subject = `Investment Cancelled - ${process.env.SITE_NAME}`;
  const planName = investment.planId
    ? investment.planId.name
    : "Investment Plan";

  const message = `
    <h2>Investment Cancellation Notice</h2>
    <p>Dear ${user.fullName},</p>
    <p>We regret to inform you that your investment request has been cancelled.</p>
    <h3>Investment Details:</h3>
    <ul>
      <li><strong>Plan:</strong> ${planName}</li>
      <li><strong>Amount:</strong> $${investment.amount.toFixed(2)}</li>
    </ul>
    ${
      reason ? `<p><strong>Reason for cancellation:</strong> ${reason}</p>` : ""
    }
    <p>If you believe this is an error or have any questions, please contact our support team.</p>
    <p>Thank you for your understanding.</p>
  `;

  try {
    await emailService.sendEmail(user.email, subject, message);
  } catch (error) {
    console.error("Error sending investment cancellation email:", error);
  }
}

/**
 * Get investment statistics for admin dashboard
 * @returns {Promise<Object>} Investment statistics
 */
async function getInvestmentStatistics() {
  try {
    // Count investments by status
    const [pendingCount, activeCount, completedCount, cancelledCount] =
      await Promise.all([
        Investment.countDocuments({ status: "pending" }),
        Investment.countDocuments({ status: "active" }),
        Investment.countDocuments({ status: "completed" }),
        Investment.countDocuments({ status: "cancelled" }),
      ]);

    // Calculate total investments amount by status
    const [pendingTotal, activeTotal, completedTotal] = await Promise.all([
      Investment.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Investment.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Investment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // Format aggregation results
    const pendingAmount = pendingTotal.length > 0 ? pendingTotal[0].total : 0;
    const activeAmount = activeTotal.length > 0 ? activeTotal[0].total : 0;
    const completedAmount =
      completedTotal.length > 0 ? completedTotal[0].total : 0;
    const totalAmount = pendingAmount + activeAmount + completedAmount;

    return {
      success: true,
      statistics: {
        counts: {
          pending: pendingCount,
          active: activeCount,
          completed: completedCount,
          cancelled: cancelledCount,
          total: pendingCount + activeCount + completedCount + cancelledCount,
        },
        amounts: {
          pending: pendingAmount,
          active: activeAmount,
          completed: completedAmount,
          total: totalAmount,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching investment statistics:", error);
    return {
      success: false,
      message: `Failed to fetch investment statistics: ${error.message}`,
    };
  }
}

/**
 * Get all pending withdrawals with pagination and filters
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} Pending withdrawal result
 */
async function getPendingWithdrawals(options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      type,
      currency,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Build query
    const query = { status: "pending" };

    if (userId) {
      query.userId = userId;
    }

    if (type) {
      query.type = type;
    }

    if (currency) {
      query.currency = currency;
    }

    // Count total documents
    const total = await Withdrawal.countDocuments(query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "fullName email username")
      .exec();

    return {
      success: true,
      withdrawals,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error);
    return {
      success: false,
      message: "Failed to fetch pending withdrawals",
    };
  }
}

/**
 * Get all withdrawals with pagination and filters
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} Withdrawal result
 */
async function getAllWithdrawals(options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      type,
      status,
      currency,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Build query
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (currency) {
      query.currency = currency;
    }

    // Count total documents
    const total = await Withdrawal.countDocuments(query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "fullName email username")
      .exec();

    return {
      success: true,
      withdrawals,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return {
      success: false,
      message: "Failed to fetch withdrawals",
    };
  }
}

/**
 * Get withdrawal by ID
 * @param {string} withdrawalId - Withdrawal ID
 * @returns {Promise<Object>} Withdrawal details
 */
async function getWithdrawalById(withdrawalId) {
  try {
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate("userId", "fullName email username")
      .exec();

    if (!withdrawal) {
      return {
        success: false,
        message: "Withdrawal not found",
      };
    }

    return {
      success: true,
      withdrawal,
    };
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    return {
      success: false,
      message: "Failed to fetch withdrawal details",
    };
  }
}

/**
 * Approve a withdrawal request
 * @param {string} withdrawalId - Withdrawal ID
 * @param {string} txHash - Transaction hash for the blockchain transaction (optional)
 * @returns {Promise<Object>} Result of the approval
 */
async function approveWithdrawal(withdrawalId, txHash = null) {
  try {
    // Find the withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return {
        success: false,
        message: "Withdrawal not found",
      };
    }

    // Check if the withdrawal is already processed
    if (withdrawal.status !== "pending") {
      return {
        success: false,
        message: `Withdrawal is already ${withdrawal.status}`,
      };
    }

    // Get the user
    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Update withdrawal status
    withdrawal.status = "completed";
    withdrawal.txHash = txHash || `ADMIN-APPROVED-${Date.now()}`;
    withdrawal.completedAt = new Date();
    await withdrawal.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: withdrawal.userId,
      type: "withdrawal",
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: "completed",
      walletAddress: withdrawal.walletAddress,
      txHash: withdrawal.txHash,
      description: `${
        withdrawal.type === "wallet" ? "Wallet" : "Referral"
      } withdrawal of ${withdrawal.amount} ${withdrawal.currency}`,
    });
    await transaction.save();

    // Send notification to user
    await notificationService.createTransactionNotification(
      withdrawal.userId,
      transaction
    );

    // Send email notification
    try {
      await sendWithdrawalCompleteEmail(user, withdrawal, "Withdrawal Approved");
    } catch (emailError) {
      console.error("Failed to send withdrawal email:", emailError);
      // Continue execution even if email fails
    }

    return {
      success: true,
      message: "Withdrawal approved successfully",
      withdrawal,
    };
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return {
      success: false,
      message: "Failed to approve withdrawal",
    };
  }
}

/**
 * Cancel a withdrawal request
 * @param {string} withdrawalId - Withdrawal ID
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<Object>} Result of the cancellation
 */
async function cancelWithdrawal(withdrawalId, reason = "") {
  try {
    // Find the withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return {
        success: false,
        message: "Withdrawal not found",
      };
    }

    // Check if the withdrawal is already processed
    if (withdrawal.status !== "pending") {
      return {
        success: false,
        message: `Withdrawal is already ${withdrawal.status}`,
      };
    }

    // Get the user
    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get user wallet to refund
    const wallet = await Wallet.findOne({ user: withdrawal.userId });
    if (!wallet) {
      return {
        success: false,
        message: "User wallet not found",
      };
    }

    // Update withdrawal status
    withdrawal.status = "cancelled";
    withdrawal.reason = reason || "Cancelled by admin";
    await withdrawal.save();

    // Return funds to wallet
    if (withdrawal.type === "wallet") {
      wallet.walletBalance += withdrawal.amount;
    } else {
      wallet.referralBalance += withdrawal.amount;
    }
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: withdrawal.userId,
      type: "withdrawal",
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: "cancelled",
      walletAddress: withdrawal.walletAddress,
      description: `${
        withdrawal.type === "wallet" ? "Wallet" : "Referral"
      } withdrawal of ${withdrawal.amount} ${withdrawal.currency} cancelled: ${
        reason || "Cancelled by admin"
      }`,
    });
    await transaction.save();

    // Send notification to user
    await notificationService.createTransactionNotification(
      withdrawal.userId,
      transaction
    );

    // Send email notification
    try {
      await sendWithdrawalCancellationEmail(user, withdrawal, reason|| "Cancelled by administrator");
    } catch (emailError) {
      console.error(
        "Failed to send withdrawal cancellation email:",
        emailError
      );
      // Continue execution even if email fails
    }

    return {
      success: true,
      message: "Withdrawal cancelled successfully",
      withdrawal,
    };
  } catch (error) {
    console.error("Error cancelling withdrawal:", error);
    return {
      success: false,
      message: "Failed to cancel withdrawal",
    };
  }
}

/**
 * Get transaction dashboard data
 */
exports.getTransactionDashboard = async () => {
  try {
    // Get total deposits
    const totalDeposits = await Transaction.countDocuments({ type: "deposit" });

    // Get total withdrawals
    const totalWithdrawals = await Withdrawal.countDocuments();

    // Get pending deposits
    const pendingDeposits = await Transaction.countDocuments({
      type: "deposit",
      status: "pending",
    });

    // Get pending withdrawals
    const pendingWithdrawals = await Withdrawal.countDocuments({
      status: "pending",
    });

    // Get total deposit amount
    const depositAmountResult = await Transaction.aggregate([
      { $match: { type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalDepositAmount =
      depositAmountResult.length > 0 ? depositAmountResult[0].total : 0;

    // Get total withdrawal amount
    const withdrawalAmountResult = await Withdrawal.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalWithdrawalAmount =
      withdrawalAmountResult.length > 0 ? withdrawalAmountResult[0].total : 0;

    // Get recent transactions
    const recentTransactions = await Transaction.find({ type: "deposit" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email");

    // Get recent withdrawals
    const recentWithdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email");

    return {
      totalDeposits,
      totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      totalDepositAmount,
      totalWithdrawalAmount,
      recentTransactions,
      recentWithdrawals,
    };
  } catch (error) {
    console.error("Error in getTransactionDashboard:", error);
    throw error;
  }
};

/**
 * Get deposits with pagination and filters
 */
exports.getDeposits = async ({ page, limit, status, search, sortOrder }) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query = { type: "deposit" };

    if (status) {
      query.status = status;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((user) => user._id);

      query.$or = [
        { userId: { $in: userIds } },
        { txHash: { $regex: search, $options: "i" } },
        { walletAddress: { $regex: search, $options: "i" } },
      ];
    }

    // Count total matching documents
    const total = await Transaction.countDocuments(query);

    // Get deposits
    const deposits = await Transaction.find(query)
      .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email username");

    // Calculate pagination info
    const pages = Math.ceil(total / limit);

    return {
      deposits,
      pagination: {
        total,
        page,
        limit,
        pages,
        sortOrder,
      },
    };
  } catch (error) {
    console.error("Error in getDeposits:", error);
    throw error;
  }
};

/**
 * Get a deposit by ID
 */
exports.getDepositById = async (depositId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(depositId)) {
      return null;
    }

    const deposit = await Transaction.findOne({
      _id: depositId,
      type: "deposit",
    }).populate("userId", "fullName email username");

    return deposit;
  } catch (error) {
    console.error("Error in getDepositById:", error);
    throw error;
  }
};

/**
 * Approve a deposit
 */
exports.approveDeposit = async (depositId) => {
  try {
    const deposit = await Transaction.findOne({
      _id: depositId,
      type: "deposit",
      status: "pending",
    });

    if (!deposit) {
      throw new Error("Deposit not found or not in pending status");
    }

    // Update deposit status
    deposit.status = "completed";
    deposit.completedAt = new Date();
    await deposit.save();

    // Update user wallet
    await Wallet.findOneAndUpdate(
      { userId: deposit.userId, currency: deposit.currency },
      { $inc: { balance: deposit.amount } },
      { new: true, upsert: true }
    );

    // Create notification
    await notificationService.createNotification({
      userId: deposit.userId,
      title: "Deposit Approved",
      message: `Your deposit of ${deposit.amount} ${deposit.currency} has been approved.`,
      type: "transaction",
    });

    return true;
  } catch (error) {
    console.error("Error in approveDeposit:", error);
    throw error;
  }
};

/**
 * Cancel a deposit
 */
exports.cancelDeposit = async (depositId, reason) => {
  try {
    const deposit = await Transaction.findOne({
      _id: depositId,
      type: "deposit",
      status: "pending",
    });

    if (!deposit) {
      throw new Error("Deposit not found or not in pending status");
    }

    // Update deposit status
    deposit.status = "cancelled";
    deposit.cancelReason = reason || "Cancelled by admin";
    deposit.completedAt = new Date();
    await deposit.save();

    // Create notification
    await notificationService.createNotification({
      userId: deposit.userId,
      title: "Deposit Cancelled",
      message: `Your deposit of ${deposit.amount} ${deposit.currency} has been cancelled. Reason: ${deposit.cancelReason}`,
      type: "transaction",
    });

    return true;
  } catch (error) {
    console.error("Error in cancelDeposit:", error);
    throw error;
  }
};

/**
 * Get withdrawals with pagination and filters
 */
exports.getWithdrawals = async ({
  page,
  limit,
  status,
  type,
  currency,
  search,
  sortOrder,
  startDate,
  endDate,
}) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (currency) {
      query.currency = currency;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((user) => user._id);

      query.$or = [
        { userId: { $in: userIds } },
        { txHash: { $regex: search, $options: "i" } },
        { walletAddress: { $regex: search, $options: "i" } },
      ];
    }

    // Count total matching documents
    const total = await Withdrawal.countDocuments(query);

    // Get withdrawals
    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email username");

    // Calculate pagination info
    const pages = Math.ceil(total / limit);

    return {
      withdrawals,
      pagination: {
        total,
        page,
        limit,
        pages,
        sortOrder,
      },
    };
  } catch (error) {
    console.error("Error in getWithdrawals:", error);
    throw error;
  }
};

/**
 * Get a withdrawal by ID
 */
exports.getWithdrawalById = async (withdrawalId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      return null;
    }

    const withdrawal = await Withdrawal.findById(withdrawalId).populate(
      "userId",
      "fullName email username"
    );

    return withdrawal;
  } catch (error) {
    console.error("Error in getWithdrawalById:", error);
    throw error;
  }
};

/**
 * Approve a withdrawal
 */
exports.approveWithdrawal = async (withdrawalId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      status: "pending",
    }).session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        message: "Withdrawal not found or not in pending status",
      };
    }

    // Update withdrawal status
    withdrawal.status = "completed";
    withdrawal.txHash = txHash;
    withdrawal.completedAt = new Date();
    await withdrawal.save({ session });

    // Create transaction record
    const transaction = new Transaction({
      userId: withdrawal.userId,
      type: "withdrawal",
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: "completed",
      walletAddress: withdrawal.walletAddress,
      txHash: txHash,
      completedAt: new Date(),
    });

    await transaction.save({ session });

    // Create notification
    await notificationService.createNotification(
      {
        userId: withdrawal.userId,
        title: "Withdrawal Approved",
        message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved. Transaction hash: ${txHash}`,
        type: "transaction",
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in approveWithdrawal:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Cancel a withdrawal and refund the user
 */
exports.cancelWithdrawal = async (withdrawalId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      status: "pending",
    }).session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        message: "Withdrawal not found or not in pending status",
      };
    }

    // Update withdrawal status
    withdrawal.status = "cancelled";
    withdrawal.cancelReason = reason || "Cancelled by admin";
    withdrawal.completedAt = new Date();
    await withdrawal.save({ session });

    // Refund the user's wallet
    if (withdrawal.type === "wallet") {
      await Wallet.findOneAndUpdate(
        { userId: withdrawal.userId, currency: withdrawal.currency },
        { $inc: { balance: withdrawal.amount + withdrawal.fee } },
        { new: true, upsert: true, session }
      );
    } else if (withdrawal.type === "referral") {
      // Refund to referral balance in the user document
      await User.findByIdAndUpdate(
        withdrawal.userId,
        { $inc: { referralBalance: withdrawal.amount + withdrawal.fee } },
        { session }
      );
    }

    // Create notification
    await notificationService.createNotification(
      {
        userId: withdrawal.userId,
        title: "Withdrawal Cancelled",
        message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been cancelled. Reason: ${withdrawal.cancelReason}. The funds have been returned to your account.`,
        type: "transaction",
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in cancelWithdrawal:", error);
    return { success: false, message: error.message };
  }
};




/**
 * Send investment cancellation email to user
 * @param {Object} user - The user object
 * @param {Object} investment - The investment object with populated planId
 * @param {string} reason - The reason for cancellation
 * @returns {Promise<void>}
 */
async function sendWithdrawalCompleteEmail(user, withdraw, title, ) {
  const subject = `${title} - ${process.env.SITE_NAME}`;


  const message = `
    <h2>Withdrawal Cancellation Notice</h2>
    <p>Dear ${user.fullName},</p>
    <p>We regret to inform you that your withdrawal request has been cancelled.</p>
    <h3>Withdrawal Details:</h3>
    <ul>
      <li><strong>Amount:</strong> $${withdraw.amount.toFixed(2)}</li>
      <li><strong>Currency:</strong> $${withdraw.currency}</li>
    </ul>

    <p>If you believe this is an error or have any questions, please contact our support team.</p>
    <p>Thank you for your understanding.</p>
  `;

  try {
    await sendEmail(user.email, subject, message);
  } catch (error) {
    console.error("Error sending investment cancellation email:", error);
  }
}







/**
 * Send withdrawal cancellation email to user
 * @param {Object} user - The user object
 * @param {Object} investment - The investment object with populated planId
 * @param {string} reason - The reason for cancellation
 * @returns {Promise<void>}
 */
async function sendWithdrawalCancellationEmail(user, investment, reason = "") {
  const subject = `Investment Cancelled - ${process.env.SITE_NAME}`;


  const message = `
    <h2>Withdrawal Cancellation Notice</h2>
    <p>Dear ${user.fullName},</p>
    <p>We regret to inform you that your withdrawal request has been cancelled.</p>
    <h3>Withdrawal Details:</h3>
    <ul>
      <li><strong>Amount:</strong> $${investment.amount.toFixed(2)}</li>
    </ul>
    ${
      reason ? `<p><strong>Reason for cancellation:</strong> ${reason}</p>` : ""
    }
    <p>If you believe this is an error or have any questions, please contact our support team.</p>
    <p>Thank you for your understanding.</p>
  `;

  try {
    await emailService.sendEmail(user.email, subject, message);
  } catch (error) {
    console.error("Error sending investment cancellation email:", error);
  }
}


module.exports = {
  getAllInvestments,
  getPendingInvestments,
  getActiveInvestments,
  getCompletedInvestments,
  getInvestmentById,
  updateInvestmentDetails,
  confirmInvestment,
  cancelInvestment,
  getInvestmentStatistics,
  getPendingWithdrawals,
  getAllWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  cancelWithdrawal,
  getTransactionDashboard: exports.getTransactionDashboard,
  getDeposits: exports.getDeposits,
  getDepositById: exports.getDepositById,
  approveDeposit: exports.approveDeposit,
  cancelDeposit: exports.cancelDeposit,
  getWithdrawals: exports.getWithdrawals,
};
