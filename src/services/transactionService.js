/**
 * @fileoverview Transaction service for handling transaction-related business logic
 */

const transactionRepository = require("../repositories/transactionRepository");
const userRepository = require("../repositories/userRepository");
const planRepository = require("../repositories/planRepository");
const currencyRepository = require("../repositories/currencyRepository");
const Investment = require("../models/investmentModel");
const AppSettings = require("../models/appSettingsModel");
const { AppError } = require("../utils/errorHandler");
const {sendEmail} = require("../utils/emailService");

/**
 * Create a new deposit request
 * @param {string} userId - User ID
 * @param {number} amount - Deposit amount in BTC
 * @param {string} walletAddress - Source wallet address
 * @returns {Promise<Object>} Created deposit transaction
 */
async function createDepositRequest(userId, amount, walletAddress) {
  try {
    // Convert amount to satoshi (smallest unit)
    const amountSatoshi = Math.floor(Number(amount) * 100000000);

    if (amountSatoshi <= 0) {
      return {
        success: false,
        message: "Deposit amount must be greater than 0",
      };
    }

    // Create the deposit transaction
    const depositData = {
      userId,
      type: "deposit",
      amount: amountSatoshi,
      currency: "BTC",
      status: "pending",
      walletAddress,
      description: `Deposit of ${amount} BTC`,
    };

    const transaction = await transactionRepository.create(depositData);

    return {
      success: true,
      transaction,
      message:
        "Deposit request created successfully. Please wait for confirmation.",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create deposit request: ${error.message}`,
    };
  }
}

/**
 * Create a new withdrawal request
 * @param {string} userId - User ID
 * @param {number} amount - Withdrawal amount in BTC
 * @param {string} walletAddress - Destination wallet address
 * @returns {Promise<Object>} Created withdrawal transaction
 */
async function createWithdrawalRequest(userId, amount, walletAddress) {
  try {
    // Convert amount to satoshi (smallest unit)
    const amountSatoshi = Math.floor(Number(amount) * 100000000);

    if (amountSatoshi <= 0) {
      return {
        success: false,
        message: "Withdrawal amount must be greater than 0",
      };
    }

    // Get user to check balance
    const user = await userRepository.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check if user has sufficient balance
    if (user.walletBalance < amountSatoshi) {
      return {
        success: false,
        message: "Insufficient balance for withdrawal",
      };
    }

    // Check if user has KYC verification for withdrawals
    if (user.kycStatus !== "approved") {
      return {
        success: false,
        message: "KYC verification required for withdrawals",
      };
    }

    // Check withdrawal limit
    if (user.withdrawalLimit > 0 && amountSatoshi > user.withdrawalLimit) {
      return {
        success: false,
        message: `Withdrawal limit exceeded. Maximum: ${
          user.withdrawalLimit / 100000000
        } BTC`,
      };
    }

    // Create the withdrawal transaction
    const withdrawalData = {
      userId,
      type: "withdrawal",
      amount: amountSatoshi,
      currency: "BTC",
      status: "pending",
      walletAddress,
      description: `Withdrawal of ${amount} BTC`,
    };

    const transaction = await transactionRepository.create(withdrawalData);

    // Update user's balance (deduct the amount immediately to prevent double-spending)
    await userRepository.updateWalletBalance(userId, -amountSatoshi);

    return {
      success: true,
      transaction,
      message:
        "Withdrawal request created successfully. Please wait for processing.",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create withdrawal request: ${error.message}`,
    };
  }
}

/**
 * Create a new investment
 * @param {string} userId - User ID
 * @param {string} planId - Investment plan ID
 * @param {number} amount - Investment amount in USD
 * @param {string} currencyId - Currency ID used for payment
 * @param {string} txHash - Transaction hash/ID from user
 * @returns {Promise<Object>} Created investment transaction
 */
async function createInvestment(userId, planId, amount, currencyId, txHash) {
  try {
    // Validate the amount
    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return {
        success: false,
        message: "Investment amount must be greater than 0",
      };
    }

    // Get the user
    const user = await userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get investment plan details
    const plan = await planRepository.findById(planId);
    if (!plan) {
      return {
        success: false,
        message: "Investment plan not found",
      };
    }

    // Check if plan is active
    if (!plan.isActive) {
      return {
        success: false,
        message: "This investment plan is currently not available",
      };
    }

    // Check if amount is within plan limits
    if (investmentAmount < plan.minAmount) {
      return {
        success: false,
        message: `Minimum investment amount is $${plan.minAmount.toFixed(2)}`,
      };
    }

    if (investmentAmount > plan.maxAmount) {
      return {
        success: false,
        message: `Maximum investment amount is $${plan.maxAmount.toFixed(2)}`,
      };
    }

    // Get currency details
    const currency = await currencyRepository.findById(currencyId);
    if (!currency) {
      return {
        success: false,
        message: "Selected payment method not found",
      };
    }

    if (!currency.isActive) {
      return {
        success: false,
        message: "Selected payment method is no longer available",
      };
    }

    // Calculate investment details based on plan
    const earningRate = plan.roiPercentage / 100; // Convert percentage to decimal
    const duration = plan.term; // Duration in days (or other units)

    // Create the investment record
    const investment = new Investment({
      userId,
      planId,
      amount: investmentAmount,
      earningRate,
      duration,
      durationUnit: plan.termPeriod,
      type: plan.type,
      status: "pending",
    });

    await investment.save();

    // Create the transaction record
    const transactionData = {
      userId,
      type: plan.type,
      amount: investmentAmount,
      currency: currency.symbol,
      status: "pending",
      txHash,
      planId,
      description: `Investment deposit for ${plan.name} plan`,
    };

    const transaction = await transactionRepository.create(transactionData);

    // Get app settings for referral processing
    const appSettings = await AppSettings.getSettings();

  

    // Send email notification to user
    await sendInvestmentConfirmationEmail(
      user,
      plan,
      investmentAmount,
      currency.symbol,
      appSettings.siteName || process.env.SITE_NAME
    );

    // Send email notification to admin
    await sendAdminNotificationEmail(
      user,
      plan,
      investmentAmount,
      currency.symbol,
      txHash,
      appSettings.siteName || process.env.SITE_NAME
    );

    return {
      success: true,
      investment,
      transaction,
      message: "Investment created successfully and pending confirmation",
    };
  } catch (error) {
    console.error("Investment creation error:", error);
    return {
      success: false,
      message: `Failed to create investment: ${error.message}`,
    };
  }
}



/**
 * Send confirmation email to user about their investment
 * @param {Object} user - The user object
 * @param {Object} plan - The investment plan
 * @param {number} amount - Investment amount
 * @param {string} currency - Currency symbol
 */
async function sendInvestmentConfirmationEmail(user, plan, amount, currency, siteName) {
  const subject = `Investment Confirmation - ${siteName}`;
  const link = `${process.env.BASE_URL}/auth/login`;
  const buttonText = "View Deposit Details";
  const message = `
    <h2>Investment Confirmation</h2>
    <p>Dear ${user.fullName},</p>
    <p>Thank you for your investment. Your request has been received and is pending confirmation.</p>
    <h3>Investment Details:</h3>
    <ul>
      <li><strong>Plan:</strong> ${plan.name}</li>
      <li><strong>Amount:</strong> $${amount} (${currency})</li>
      <li><strong>Status:</strong> Pending</li>
    </ul>
    <p>You will receive another email once your investment is confirmed by our team.</p>
    <p>Thank you for investing with EXNESTRADE.</p>
  `;

  try {
    await sendEmail(user.email, subject, message, link, buttonText);  
  } catch (error) {
    console.error("Error sending investment confirmation email:", error);
  }
}

/**
 * Send notification email to admin about new investment
 * @param {Object} user - The user object
 * @param {Object} plan - The investment plan
 * @param {number} amount - Investment amount
 * @param {string} currency - Currency symbol
 * @param {string} txHash - Transaction hash/ID
 */
async function sendAdminNotificationEmail(
  user,
  plan,
  amount,
  currency,
  txHash,
  siteName,
) {
  // In a real app, you would fetch admin emails from the database or config
  const adminEmail = process.env.EMAIL_USER ;
  const subject = `New Investment Notification - ${siteName}`;
  const link = `${process.env.BASE_URL}/auth/login`;
  const buttonText = "View Deposit Details";
  const message = `
    <h2>New Investment Notification</h2> 
    <p>A new investment has been made and requires verification.</p>
    <h3>Investment Details:</h3>
    <ul>
      <li><strong>User:</strong> ${user.fullName} (${user.email})</li>
      <li><strong>Plan:</strong> ${plan.name}</li>
      <li><strong>Amount:</strong> $${amount} (${currency})</li>
      <li><strong>Transaction ID:</strong> ${txHash || "Not provided"}</li>
      <li><strong>Status:</strong> Pending</li>
    </ul>
    <p>Please log in to the admin dashboard to review and confirm this investment.</p>
  `;

  try {
    await sendEmail(adminEmail, subject, message, link, buttonText);
  } catch (error) {
    console.error("Error sending admin notification email:", error);
  }
}

/**
 * Send notification email about referral commission
 * @param {Object} referrer - The referrer user
 * @param {Object} invester - The user who made the investment
 * @param {number} commissionAmount - Referral commission amount
 * @param {number} level - Referral level
 * @param {number} commissionRate - Commission rate in percent
 */
// async function sendReferralCommissionEmail(
//   referrer,
//   invester,
//   commissionAmount,
//   level,
//   commissionRate,
//   siteName
// ) {
//   const subject = `Referral Commission Earned  - ${siteName}`;
//   const link = `${process.env.BASE_URL}/auth/login`;
//   const buttonText = "View Deposit Details";
  
//   const message = `
//     <h2>Congratulations on Your Referral Reward!</h2>
//     <p>Dear ${referrer.fullName},</p>
//     <p>You have earned a referral commission from your level ${level} referral's investment.</p>
//     <h3>Commission Details:</h3>
//     <ul>
//       <li><strong>Amount Earned:</strong> $${commissionAmount.toFixed(2)}</li>
//       <li><strong>Commission Rate:</strong> ${commissionRate}%</li>
//       <li><strong>Referral Level:</strong> ${level}</li>
//       <li><strong>Referral:</strong> ${invester.fullName}</li>
//     </ul>
//     <p>The commission has been added to your account balance.</p>
//     <p>Thank you for being a valued member of EXNESTRADE.</p>
//   `;

//   try {
//     await sendEmail(referrer.email, subject, message, link, buttonText);
//   } catch (error) {
//     console.error("Error sending referral commission email:", error);
//   }
// }

/**
 * Get user's investments
 * @param {string} userId - User ID
 * @param {Object} queryOptions - Query options for filtering and pagination
 * @returns {Promise<Object>} User investments
 */
async function getUserInvestments(userId, queryOptions = {}) {
  try {
    // Query the Investment model for this user's investments
    let query = Investment.find({ userId }).populate("planId");

    // Apply status filter if provided
    if (queryOptions.status) {
      query = query.find({ status: queryOptions.status });
    }

    // Apply pagination
    const page = parseInt(queryOptions.page) || 1;
    const limit = parseInt(queryOptions.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit).sort({ createdAt: -1 });

    // Execute query
    const investments = await query.exec();
    const total = await Investment.countDocuments({
      userId,
      ...(queryOptions.status && { status: queryOptions.status }),
    });

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
    return {
      success: false,
      message: `Failed to fetch user investments: ${error.message}`,
    };
  }
}

/**
 * Get user's transactions
 * @param {string} userId - User ID
 * @param {Object} queryOptions - Query options for filtering and pagination
 * @returns {Promise<Object>} User transactions
 */
async function getUserTransactions(userId, queryOptions = {}) {
  try {
    const result = await transactionRepository.findUserTransactions(
      userId,
      queryOptions
    );


    return {
      success: true,
      transactions: result,
      pagination: result.pagination,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch user transactions: ${error.message}`,
    };
  }
}

/**
 * Get transactions by type and status (admin use)
 * @param {Object} filters - Filter options
 * @param {Object} paginationOptions - Pagination options
 * @returns {Promise<Object>} Filtered transactions
 */
async function getTransactionsByFilters(filters = {}, paginationOptions = {}) {
  try {
    const result = await transactionRepository.findByTypeAndStatus(
      filters.type,
      filters.status,
      paginationOptions
    );

    return {
      success: true,
      transactions: result,
      pagination: result.pagination,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch transactions: ${error.message}`,
    };
  }
}

// getTransactionById
async function getTransactionById(txtId) {
  try {
    const transaction = await transactionRepository.findById(txtId);

    if (!transaction) {
      return {
        success: false,
        message: "Transaction not found",
      };
    }

    return {
      success: true,
      transaction: transaction,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch transaction: ${error.message}`,
    };
  }
}



/**
 * Get pending transactions (admin use)
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} Pending transactions
 */
async function getPendingTransactions(options = {}) {
  try {
    const result = await transactionRepository.findPendingTransactions(options);

    // Convert amounts from satoshi to BTC for display
    const formattedData = result.data.map((transaction) =>
      formatTransactionForDisplay(transaction)
    );

    return {
      success: true,
      transactions: formattedData,
      pagination: result.pagination,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch pending transactions: ${error.message}`,
    };
  }
}

/**
 * Process transaction (approve, reject, etc.)
 * @param {string} transactionId - Transaction ID
 * @param {string} action - Action to perform (approve, reject, cancel)
 * @param {Object} actionData - Additional data for the action (e.g., txHash)
 * @returns {Promise<Object>} Updated transaction
 */
async function processTransaction(transactionId, action, actionData = {}) {
  try {
    const transaction = await transactionRepository.findById(transactionId);

    if (!transaction) {
      return {
        success: false,
        message: "Transaction not found",
      };
    }

    // Only process pending transactions
    if (transaction.status !== "pending") {
      return {
        success: false,
        message: `Cannot process a transaction that is already ${transaction.status}`,
      };
    }

    let newStatus;
    let updateData = {};
    let affectBalance = false;
    let balanceChange = 0;

    // Determine the action to take
    switch (action.toLowerCase()) {
      case "approve":
        newStatus = "completed";

        // Add transaction hash if provided
        if (actionData.txHash) {
          updateData.txHash = actionData.txHash;
        }

        // For deposits, add to user's balance
        if (transaction.type === "deposit") {
          affectBalance = true;
          balanceChange = transaction.amount;
        }

        break;

      case "reject":
        newStatus = "failed";

        // For withdrawals, refund the amount to user's balance
        if (transaction.type === "withdrawal") {
          affectBalance = true;
          balanceChange = transaction.amount;
        }

        break;

      case "cancel":
        newStatus = "cancelled";

        // For withdrawals, refund the amount to user's balance
        if (transaction.type === "withdrawal") {
          affectBalance = true;
          balanceChange = transaction.amount;
        }

        break;

      default:
        return {
          success: false,
          message: "Invalid action",
        };
    }

    // Update transaction status
    const updatedTransaction =
      await transactionRepository.updateTransactionStatus(
        transactionId,
        newStatus,
        updateData
      );

    // Update user balance if needed
    if (affectBalance) {
      await userRepository.updateWalletBalance(
        transaction.userId,
        balanceChange
      );
    }

    return {
      success: true,
      transaction: formatTransactionForDisplay(updatedTransaction),
      message: `Transaction ${action}ed successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to process transaction: ${error.message}`,
    };
  }
}

/**
 * Get transaction statistics (admin use)
 * @returns {Promise<Object>} Transaction statistics
 */
async function getTransactionStatistics() {
  try {
    const stats = await transactionRepository.getTransactionStatistics();

    // Convert amounts from satoshi to BTC for display
    if (stats.totals) {
      stats.totals.totalAmountDisplay = (
        stats.totals.totalAmount / 100000000
      ).toFixed(8);
      stats.totals.avgAmountDisplay = (
        stats.totals.avgAmount / 100000000
      ).toFixed(8);
    }

    if (stats.byType) {
      stats.byType.forEach((type) => {
        type.totalAmountDisplay = (type.totalAmount / 100000000).toFixed(8);
        if (type.statusBreakdown) {
          type.statusBreakdown.forEach((status) => {
            status.totalDisplay = (status.total / 100000000).toFixed(8);
          });
        }
      });
    }

    if (stats.byStatus) {
      stats.byStatus.forEach((status) => {
        status.totalDisplay = (status.total / 100000000).toFixed(8);
      });
    }

    return {
      success: true,
      statistics: stats,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch transaction statistics: ${error.message}`,
    };
  }
}

/**
 * Format transaction data for display (convert from satoshi to BTC)
 * @param {Object} transaction - Transaction data from database
 * @returns {Object} Formatted transaction data
 */
function formatTransactionForDisplay(transaction) {
  const txObject = transaction.toObject
    ? transaction.toObject()
    : { ...transaction };

  return {
    ...txObject,
    amountDisplay: (transaction.amount / 100000000).toFixed(8),
  };
}

module.exports = {
  createDepositRequest,
  createWithdrawalRequest,
  createInvestment,
  getUserInvestments,
  getUserTransactions,
  getTransactionById,
  getTransactionsByFilters,
  getPendingTransactions,
  processTransaction,
  getTransactionStatistics,
};
