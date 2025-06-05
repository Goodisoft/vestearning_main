/**
 * @fileoverview User repository for handling user-related database operations
 */

const User = require("../models/userModel");
const BaseRepository = require("./baseRepository");

/**
 * Repository for user-related database operations
 * @extends BaseRepository
 */
class UserRepository extends BaseRepository {
  /**
   * Create a new UserRepository instance
   */
  constructor() {
    super(User);
  }

  /**
   * Find a user by referral code
   * @param {string} referralCode - The referral code to search for
   * @returns {Promise<User>} The user
   */
  async findByReferralCode(referralCode) {
    try {
      return await User.findOne({ referralCode: referralCode });
    } catch (error) {
      throw new Error(`Error finding users by referral code: ${error.message}`);
    }
  }

  /**
   * Find users Downlines by referral code
   * @param {string} referralCode - The referral code to search for
   * @returns {Promise<Array<User>>} List of users whose referredBy mataches the upline referral code
   */
  async findUsersDownlines(referralCode) {
    try {
      return await User.find({ referredBy: referralCode });
    } catch (error) {
      throw new Error(`Error finding users by referral code: ${error.message}`);
    }
  }

  /**
   * Update a user's profile
   * @param {string} userId - The ID of the user
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<User>} The updated user
   */
  async updateProfile(userId, profileData) {
    try {
      // Ensure sensitive fields can't be updated through this method
      const allowedFields = ["fullName", "country", "withdrawalAddress"];
      const filteredData = Object.keys(profileData)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = profileData[key];
          return obj;
        }, {});

      return await User.findByIdAndUpdate(userId, filteredData, { new: true });
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  /**
   * Update a user's KYC status
   * @param {string} userId - The ID of the user
   * @param {string} status - New KYC status ('pending', 'approved', 'rejected')
   * @returns {Promise<User>} The updated user
   */
  async updateKycStatus(userId, status) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { kycStatus: status },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating KYC status: ${error.message}`);
    }
  }

  /**
   * Add KYC documents to a user
   * @param {string} userId - The ID of the user
   * @param {Object} documentData - Document data to add
   * @returns {Promise<User>} The updated user
   */
  async addKycDocument(userId, documentData) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $push: { kycDocuments: documentData } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error adding KYC document: ${error.message}`);
    }
  }

  /**
   * Update a user's wallet balance
   * @param {string} userId - The ID of the user
   * @param {number} amount - Amount to update (positive for deposit, negative for withdrawal)
   * @returns {Promise<User>} The updated user
   */
  async updateWalletBalance(userId, amount) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: amount } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating wallet balance: ${error.message}`);
    }
  }

  /**
   * Update a user's withdrawal limit
   * @param {string} userId - The ID of the user
   * @param {number} limit - New withdrawal limit
   * @returns {Promise<User>} The updated user
   */
  async updateWithdrawalLimit(userId, limit) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { withdrawalLimit: limit },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating withdrawal limit: ${error.message}`);
    }
  }

  /**
   * Block or unblock a user
   * @param {string} userId - The ID of the user
   * @param {boolean} blocked - Whether to block (true) or unblock (false)
   * @returns {Promise<User>} The updated user
   */
  async toggleBlockStatus(userId, blocked) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { isBlocked: blocked },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error toggling block status: ${error.message}`);
    }
  }

  /**
   * Get user's referral tree
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} Object containing referral tree data
   */
  async getReferralTree(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Find direct referrals (level 1)
      const directReferrals = await User.find({ referredBy: user._id }).select(
        "_id fullName email createdAt walletBalance"
      );

      // Find indirect referrals (level 2)
      const directReferralIds = directReferrals.map((referral) => referral._id);
      const indirectReferrals = await User.find({
        referredBy: { $in: directReferralIds },
      }).select("_id fullName email createdAt walletBalance referredBy");

      return {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          referralCode: user.referralCode,
        },
        directReferrals,
        indirectReferrals,
      };
    } catch (error) {
      throw new Error(`Error getting referral tree: ${error.message}`);
    }
  }

  /**
   * Count all documents
   * @param {string} userId - The ID of the user
   * @returns {Promise<User>} The user
   */
  // count all documents
  async countAllDocuments() {
    try {
      return await User.countDocuments({ role: "user" });
    } catch (error) {
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }


  // countUsersByKycStatus
  async countUsersByKycStatus(kycStatus) {
    try {
      return await User.countDocuments({ kycStatus: kycStatus });
    } catch (error) {
      throw new Error(`Error counting users by KYC status: ${error.message}`);
    }
  }

  /**
   * Update user password
   * @param {string} userId - The ID of the user
   * @param {string} newPassword - The new password
   * @returns {Promise<User>} The updated user  
   */
  async updatePassword(userId, hashedPassword) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating user password: ${error.message}`);
    }
  }

}

module.exports = new UserRepository();
