/**
 * @fileoverview Transaction repository for handling transaction-related database operations
 */

const Transaction = require("../models/transactionModel");
const BaseRepository = require("./baseRepository");

/**
 * Repository for transaction-related database operations
 * @extends BaseRepository
 */
class TransactionRepository extends BaseRepository {
  /**
   * Create a new TransactionRepository instance
   */
  constructor() {
    super(Transaction);
  }

  /**
   * Find user's transactions
   * @param {string} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array<Transaction>>} List of transactions
   */
  async findUserTransactions(userId, options = {}) {
    try {
      const query = { userId };

      // Apply type filter if provided
      if (options.type) {
        query.type = options.type;
      }

      // Apply status filter if provided
      if (options.status) {
        query.status = options.status;
      }

      // Set up sort option with default to latest transactions first
      const sort = options.sortBy
        ? { [options.sortBy]: options.order || -1 }
        : { createdAt: -1 };

      // Set up pagination
      const limit = options.limit ? parseInt(options.limit) : 20;
      const skip = options.page ? (parseInt(options.page) - 1) * limit : 0;

      // Execute query with population of related data
      const transactions = await Transaction.find(query)
        .populate("planId", "name code roiPercentage termDays")
        .populate("referralId", "fullName email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const totalCount = await Transaction.countDocuments(query);

      return {
        data: transactions,
        pagination: {
          total: totalCount,
          page: options.page ? parseInt(options.page) : 1,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error finding user transactions: ${error.message}`);
    }
  }

  /**
   * Find pending transactions
   * @param {Object} options - Filter options
   * @returns {Promise<Array<Transaction>>} List of pending transactions
   */
  async findPendingTransactions(options = {}) {
    try {
      const query = { status: "pending" };

      // Apply type filter if provided
      if (options.type) {
        query.type = options.type;
      }

      // Set up sort option with default to oldest first (for processing order)
      const sort = options.sortBy
        ? { [options.sortBy]: options.order || 1 }
        : { createdAt: 1 };

      // Set up pagination
      const limit = options.limit ? parseInt(options.limit) : 20;
      const skip = options.page ? (parseInt(options.page) - 1) * limit : 0;

      // Execute query with population of related data
      const transactions = await Transaction.find(query)
        .populate("userId", "fullName email walletBalance")
        .populate("planId", "name code roiPercentage termDays")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const totalCount = await Transaction.countDocuments(query);

      return {
        data: transactions,
        pagination: {
          total: totalCount,
          page: options.page ? parseInt(options.page) : 1,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error finding pending transactions: ${error.message}`);
    }
  }

  /**
   * Update transaction status
   * @param {string} transactionId - Transaction ID
   * @param {string} status - New status
   * @param {Object} updateData - Additional data to update
   * @returns {Promise<Transaction>} Updated transaction
   */
  async updateTransactionStatus(transactionId, status, updateData = {}) {
    try {
      const update = {
        status,
        ...updateData,
      };

      // If status is 'completed', set completedAt timestamp
      if (status === "completed") {
        update.completedAt = Date.now();
      }

      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        update,
        { new: true }
      )
        .populate("userId", "fullName email walletBalance")
        .populate("planId", "name code roiPercentage termDays");

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return transaction;
    } catch (error) {
      throw new Error(`Error updating transaction status: ${error.message}`);
    }
  }

  /**
   * Find transactions by type and status
   * @param {string} type - Transaction type
   * @param {string} status - Transaction status
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Object>} Transactions and pagination info
   */
  async findByTypeAndStatus(type, status, options = {}) {
    try {
      const query = {};

      if (type) query.type = type;
      if (status) query.status = status;

      // Set up sort option with default to latest transactions first
      const sort = options.sortBy
        ? { [options.sortBy]: options.order || -1 }
        : { createdAt: -1 };

      // Set up pagination
      const limit = options.limit ? parseInt(options.limit) : 20;
      const skip = options.page ? (parseInt(options.page) - 1) * limit : 0;

      // Execute query with population of related data
      const transactions = await Transaction.find(query)
        .populate("userId", "fullName email")
        .populate("planId", "name code")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const totalCount = await Transaction.countDocuments(query);

      return {
        data: transactions,
        pagination: {
          total: totalCount,
          page: options.page ? parseInt(options.page) : 1,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `Error finding transactions by type and status: ${error.message}`
      );
    }
  }

  /**
   * Get transaction statistics
   * @returns {Promise<Object>} Transaction statistics
   */
  async getTransactionStatistics() {
    try {
      // Get counts by type and status
      const typeStats = await Transaction.aggregate([
        {
          $group: {
            _id: {
              type: "$type",
              status: "$status",
            },
            count: { $sum: 1 },
            total: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: "$_id.type",
            statusBreakdown: {
              $push: {
                status: "$_id.status",
                count: "$count",
                total: "$total",
              },
            },
            totalCount: { $sum: "$count" },
            totalAmount: { $sum: "$total" },
          },
        },
      ]);

      // Get count by status
      const statusStats = await Transaction.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Get total counts and amounts
      const totalStats = await Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            avgAmount: { $avg: "$amount" },
          },
        },
      ]);

      return {
        byType: typeStats,
        byStatus: statusStats,
        totals: totalStats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          avgAmount: 0,
        },
      };
    } catch (error) {
      throw new Error(`Error getting transaction statistics: ${error.message}`);
    }
  }

  /**
   * Create investment transaction and related earnings records
   * @param {Object} investmentData - Investment data
   * @returns {Promise<Object>} Created investment transaction and earnings records
   */
  async createInvestmentTransaction(investmentData) {
    try {
      // Create the main investment transaction
      const investment = await Transaction.create({
        userId: investmentData.userId,
        type: "investment",
        amount: investmentData.amount,
        currency: investmentData.currency,
        status: "pending",
        planId: investmentData.planId,
        description: `Investment in ${investmentData.planName || "plan"}`,
      });

      return investment;
    } catch (error) {
      throw new Error(
        `Error creating investment transaction: ${error.message}`
      );
    }
  }


}



module.exports = new TransactionRepository();
