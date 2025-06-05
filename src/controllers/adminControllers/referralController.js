/**
 * @description Controller for managing referrals in the admin panel
 */
const User = require("../../models/userModel");
const Transaction = require("../../models/transactionModel");
const Wallet = require("../../models/walletModel");
const AppSettings = require("../../models/appSettingsModel");
const { errorHandler } = require("../../utils/errorHandler");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

class ReferralController {
  /**
   * @description Render referral earnings history page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async referralEarningList(req, res) {
    try {
      // Get app settings to check if referral system is enabled
      const appSettings = await AppSettings.getSettings();

      // Get some basic referral stats for the page header
      const totalReferralTransactions = await Transaction.countDocuments({
        type: "referral",
      });
      const totalReferralAmount = await Transaction.aggregate([
        { $match: { type: "referral", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const total =
        totalReferralAmount.length > 0 ? totalReferralAmount[0].total : 0;

      return res.render("adminViews/referral_earning_history.ejs", {
        title: "Referral Earnings History",
        referralEnabled: appSettings.referralSystem.enabled,
        referralLevels: appSettings.referralSystem.levels,
        totalTransactions: totalReferralTransactions,
        totalAmount: total,
        user: req.user,
      });
    } catch (error) {
      console.error("Error rendering referral page:", error);
      return res.status(500).render("error", { error });
    }
  }

  /**
   * @description Get all referral earnings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getReferralEarnings(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        sortBy = "createdAt",
        sortOrder = -1,
      } = req.query;

      const skip = (page - 1) * limit;
      const query = { type: "referral" };

      // Apply filters if provided
      if (search) {
        const searchPattern = new RegExp(search, "i");
        query.$or = [{ txHash: searchPattern }, { description: searchPattern }];
      }

      if (status) {
        query.status = status;
      }

      // Execute main query with pagination
      const transactions = await Transaction.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "fullName email referralCode")
        .populate("referralId", "fullName email referralCode")
        .lean();

      // Get total count for pagination
      const totalDocuments = await Transaction.countDocuments(query);

      // Additional stats
      const stats = await Transaction.aggregate([
        { $match: { type: "referral" } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]);

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          amount: stat.amount,
        };
        return acc;
      }, {});

      return res.status(200).json({
        status: "success",
        data: {
          transactions,
          pagination: {
            total: totalDocuments,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalDocuments / limit),
          },
          stats: formattedStats,
        },
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  /**
   * @description Get referral tree for a specific user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getReferralTree(req, res) {
    try {
      const { userId } = req.params;
      const { levels = 3 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID",
        });
      }

      // Find the user
      const user = await User.findById(userId).select(
        "fullName email referralCode referralNeeded"
      );

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Build referral tree up to the specified levels
      const referralTree = await buildReferralTree(user, parseInt(levels));

      // Get earnings per level
      const earningsPerLevel = await Transaction.aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            type: "referral",
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$description", // we'll use description to store level info
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            referralCode: user.referralCode,
            referralNeeded: user.referralNeeded,
          },
          referralTree,
          earningsPerLevel,
        },
      });
    } catch (error) {
      console.log("Error fetching referral tree:", error);

      return errorHandler(res, error);
    }
  }

  /**
   * @description Get referral statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getReferralStatistics(req, res) {
    try {
      // Get app settings
      const appSettings = await AppSettings.getSettings();

      // Get total users with referrals
      const usersWithReferrals = await User.countDocuments({
        referredBy: { $exists: true, $ne: null },
      });

      // Get top referrers
      const topReferrers = await User.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "referredBy",
            as: "referrals",
          },
        },
        {
          $project: {
            fullName: 1,
            email: 1,
            referralCode: 1,
            referralsCount: { $size: "$referrals" },
          },
        },
        { $sort: { referralsCount: -1 } },
        { $limit: 10 },
      ]);

      // Get users with most earnings
      const topEarners = await Wallet.aggregate([
        { $match: { referralBalance: { $gt: 0 } } },
        { $sort: { referralBalance: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: 1,
            referralBalance: 1,
            fullName: "$userInfo.fullName",
            email: "$userInfo.email",
            referralCode: "$userInfo.referralCode",
          },
        },
      ]);

      // Get recent referral transactions
      const recentTransactions = await Transaction.find({ type: "referral" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "fullName email")
        .populate("referralId", "fullName email")
        .lean();

      // Get total referral earnings
      const totalEarnings = await Transaction.aggregate([
        { $match: { type: "referral", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          referralSystem: appSettings.referralSystem,
          usersWithReferrals,
          topReferrers,
          topEarners,
          recentTransactions,
          totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        },
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  /**
   * @description Update user's referralNeeded value
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateReferralNeeded(req, res) {
    try {
      const { userId } = req.params;
      const { referralNeeded } = req.body;
      console.log("params", req.params);
        console.log("body", req.body);
      

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID",
        });
      }

      if (typeof referralNeeded !== "number" || referralNeeded < 0) {
        return res.status(400).json({
          status: "error",
          message: "Referral needed must be a positive number",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { referralNeeded } },
        { new: true, runValidators: true }
      ).select("fullName email referralCode referralNeeded");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Referral needed updated successfully",
        data: {
          user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            referralCode: user.referralCode,
            referralNeeded: user.referralNeeded,
          },
        },
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  /**
   * @description Get list of users with referral information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUsersList(req, res) {
    try {
      const { page = 1, limit = 100 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get users with basic info and join with wallet for referral balance
      const users = await User.aggregate([
        {
          $project: {
            _id: 1,
            fullName: 1,
            email: 1,
            referralCode: 1,
            referralNeeded: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]);

      // Get referrals count for each user
      const usersWithReferrals = await Promise.all(
        users.map(async (user) => {
          // Count direct referrals
          const referralsCount = await User.countDocuments({
            referredBy: user._id,
          });

          // Get wallet info
          const wallet = await Wallet.findOne({ user: user._id })
            .select("referralBalance")
            .lean();

          return {
            ...user,
            referralsCount,
            referralBalance: wallet?.referralBalance || 0,
          };
        })
      );

      // Get total count for pagination
      const total = await User.countDocuments();

      return res.status(200).json({
        status: "success",
        data: {
          users: usersWithReferrals,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  /**
   * @description Search for users by name, email, or referral code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchUsers(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          status: "error",
          message: "Search query must be at least 2 characters",
        });
      }

      const searchPattern = new RegExp(query, "i");

      // Search users by name, email, or referral code
      const users = await User.find({
        $or: [
          { fullName: searchPattern },
          { email: searchPattern },
          { referralCode: searchPattern },
        ],
      })
        .select("_id fullName email referralCode referralNeeded")
        .limit(20)
        .lean();

      // Get referrals count for each user
      const usersWithReferrals = await Promise.all(
        users.map(async (user) => {
          // Count direct referrals
          const referralsCount = await User.countDocuments({
            referredBy: user._id,
          });

          // Get wallet info
          const wallet = await Wallet.findOne({ user: user._id })
            .select("referralBalance")
            .lean();

          return {
            ...user,
            referralsCount,
            referralBalance: wallet?.referralBalance || 0,
          };
        })
      );

      return res.status(200).json({
        status: "success",
        data: {
          users: usersWithReferrals,
        },
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  }


  

}

/**
 * Helper function to build a referral tree for a user
 * @param {Object} rootUser - The user for whom to build the tree
 * @param {Number} maxLevels - Maximum levels to traverse
 * @param {Number} currentLevel - Current level in the recursion
 * @returns {Promise<Object>} - Referral tree structure
 */
async function buildReferralTree(rootUser, maxLevels, currentLevel = 1) {
  if (currentLevel > maxLevels) {
    return null;
  }

  // Find direct referrals
  const directReferrals = await User.find({ referredBy: rootUser._id })
    .select("_id fullName email referralCode createdAt")
    .lean();

  // Get referral counts and earnings for each direct referral
  const referralsWithDetails = await Promise.all(
    directReferrals.map(async (referral) => {
      // Count sub-referrals
      const subReferralsCount = await User.countDocuments({
        referredBy: referral._id,
      });

      // Get wallet info
      const wallet = await Wallet.findOne({ user: referral._id })
        .select("referralBalance")
        .lean();

      // Get transaction total
      const transactions = await Transaction.aggregate([
        {
          $match: {
            userId: referral._id,
            type: { $in: ["deposit", "withdrawal", "investment"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      // Get children if not at max depth
      let children = null;
      if (currentLevel < maxLevels) {
        children = await buildReferralTree(
          referral,
          maxLevels,
          currentLevel + 1
        );
      }

      return {
        ...referral,
        subReferralsCount,
        referralBalance: wallet?.referralBalance || 0,
        transactionTotal: transactions.length > 0 ? transactions[0].total : 0,
        children,
      };
    })
  );

  return referralsWithDetails;
}

module.exports = ReferralController;
