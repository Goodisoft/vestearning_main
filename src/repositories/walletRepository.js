/**
 * @fileoverview Wallet repository for handling wallet-related database operations
 */

const Wallet = require("../models/walletModel");
const BaseRepository = require("./baseRepository");

/**
 * Repository for wallet-related database operations
 * @extends BaseRepository
 */
class WalletRepository extends BaseRepository {
  /**
   * Create a new WalletRepository instance
   */
  constructor() {
    super(Wallet);
  }

  /**
   * Find a wallet by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Wallet>} The wallet
   */
  async findByUserId(userId) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error("Wallet not found for this user");
      }
      return wallet;
    } catch (error) {
      throw new Error(`Error finding wallet by user ID: ${error.message}`);
    }
  }

  /**
   * Create a wallet for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Wallet>} The created wallet
   */
  async createWallet(userId) {
    try {
      const walletExists = await Wallet.findOne({ user: userId });
      if (walletExists) {
        throw new Error("Wallet already exists for this user");
      }

      const wallet = new Wallet({
        user: userId,
        totalDeposit: 0,
        totalWithdrawal: 0,
        walletBalance: 0,
        referralBalance: 0,
      });

      return await wallet.save();
    } catch (error) {
      throw new Error(`Error creating wallet: ${error.message}`);
    }
  }

  /**
   * Update wallet balance
   * @param {string} userId - The ID of the user
   * @param {number} amount - Amount to update
   * @returns {Promise<Wallet>} The updated wallet
   */
  async updateWalletBalance(userId, amount) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error("Wallet not found for this user");
      }

      wallet.walletBalance += amount;
      return await wallet.save();
    } catch (error) {
      throw new Error(`Error updating wallet balance: ${error.message}`);
    }
  }

  /**
   * Update total deposit
   * @param {string} userId - The ID of the user
   * @param {number} amount - Amount to add to total deposit
   * @returns {Promise<Wallet>} The updated wallet
   */
  async updateTotalDeposit(userId, amount) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error("Wallet not found for this user");
      }

      wallet.totalDeposit += amount;
      return await wallet.save();
    } catch (error) {
      throw new Error(`Error updating total deposit: ${error.message}`);
    }
  }

  /**
   * Update total withdrawal
   * @param {string} userId - The ID of the user
   * @param {number} amount - Amount to add to total withdrawal
   * @returns {Promise<Wallet>} The updated wallet
   */
  async updateTotalWithdrawal(userId, amount) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error("Wallet not found for this user");
      }

      if (wallet.walletBalance < amount) {
        throw new Error("Insufficient funds");
      }

      wallet.totalWithdrawal += amount;
      wallet.walletBalance -= amount;
      return await wallet.save();
    } catch (error) {
      throw new Error(`Error updating total withdrawal: ${error.message}`);
    }
  }

  /**
   * Update referral balance
   * @param {string} userId - The ID of the user
   * @param {number} amount - Amount to add to referral balance
   * @returns {Promise<Wallet>} The updated wallet
   */
  async updateReferralBalance(userId, amount) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error("Wallet not found for this user");
      }

      wallet.referralBalance += amount;
      return await wallet.save();
    } catch (error) {
      throw new Error(`Error updating referral balance: ${error.message}`);
    }
  }

  /**
   * Get wallet statistics for admin dashboard
   * @returns {Promise<Object>} Statistics about wallets
   */
  async getWalletStats() {
    try {
      const stats = await Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalDeposits: { $sum: "$totalDeposit" },
            totalWithdrawals: { $sum: "$totalWithdrawal" },
            totalWalletBalance: { $sum: "$walletBalance" },
            totalReferralBalance: { $sum: "$referralBalance" },
            walletCount: { $sum: 1 },
          },
        },
      ]);

      return stats.length > 0
        ? stats[0]
        : {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalWalletBalance: 0,
            totalReferralBalance: 0,
            walletCount: 0,
          };
    } catch (error) {
      throw new Error(`Error getting wallet statistics: ${error.message}`);
    }
  }
}

module.exports = new WalletRepository();
