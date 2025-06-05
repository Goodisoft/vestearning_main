/**
 * @fileoverview Wallet service for handling wallet-related business logic
 */

const walletRepository = require("../repositories/walletRepository");

/**
 * Get user wallet information
 * @param {string} userId - The ID of the user
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function getUserWallet(userId) {
  try {
    const wallet = await walletRepository.findByUserId(userId);

    return {
      success: true,
      wallet,
      message: "Wallet retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get wallet: ${error.message}`,
    };
  }
}

/**
 * Initialize a wallet for a new user
 * @param {string} userId - The ID of the user
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function initializeWallet(userId) {
  try {
    const wallet = await walletRepository.createWallet(userId);

    return {
      success: true,
      wallet,
      message: "Wallet initialized successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to initialize wallet: ${error.message}`,
    };
  }
}

/**
 * Process a deposit to a user's wallet
 * @param {string} userId - The ID of the user
 * @param {number} amount - Amount to deposit
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function processDeposit(userId, amount) {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Invalid deposit amount");
    }

    const wallet = await walletRepository.updateTotalDeposit(userId, amount);

    return {
      success: true,
      wallet,
      message: "Deposit processed successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to process deposit: ${error.message}`,
    };
  }
}

/**
 * Process a withdrawal from a user's wallet
 * @param {string} userId - The ID of the user
 * @param {number} amount - Amount to withdraw
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function processWithdrawal(userId, amount) {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    const wallet = await walletRepository.findByUserId(userId);

    if (wallet.walletBalance < amount) {
      return {
        success: false,
        message: "Insufficient funds for withdrawal",
      };
    }

    const updatedWallet = await walletRepository.updateTotalWithdrawal(
      userId,
      amount
    );

    return {
      success: true,
      wallet: updatedWallet,
      message: "Withdrawal processed successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to process withdrawal: ${error.message}`,
    };
  }
}

/**
 * Add referral bonus to a user's wallet
 * @param {string} userId - The ID of the user
 * @param {number} amount - Referral bonus amount
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function addReferralBonus(userId, amount) {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Invalid referral bonus amount");
    }

    const wallet = await walletRepository.updateReferralBalance(userId, amount);

    return {
      success: true,
      wallet,
      message: "Referral bonus added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to add referral bonus: ${error.message}`,
    };
  }
}

/**
 * Transfer funds between wallets
 * @param {string} fromUserId - The ID of the sender user
 * @param {string} toUserId - The ID of the recipient user
 * @param {number} amount - Amount to transfer
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function transferFunds(fromUserId, toUserId, amount) {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    // Check if sender has sufficient funds
    const senderWallet = await walletRepository.findByUserId(fromUserId);
    if (senderWallet.walletBalance < amount) {
      return {
        success: false,
        message: "Insufficient funds for transfer",
      };
    }

    // Deduct from sender
    await walletRepository.updateWalletBalance(fromUserId, -amount);

    // Add to recipient
    await walletRepository.updateWalletBalance(toUserId, amount);

    return {
      success: true,
      message: "Funds transferred successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to transfer funds: ${error.message}`,
    };
  }
}

/**
 * Get wallet statistics for admin dashboard
 * @returns {Promise<{success: boolean, stats?: Object, message: string}>}
 */
async function getWalletStatistics() {
  try {
    const stats = await walletRepository.getWalletStats();

    return {
      success: true,
      stats,
      message: "Wallet statistics retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get wallet statistics: ${error.message}`,
    };
  }
}

module.exports = {
  getUserWallet,
  initializeWallet,
  processDeposit,
  processWithdrawal,
  addReferralBonus,
  transferFunds,
  getWalletStatistics,
};
