/**
 * @fileoverview Authentication repository for handling database operations related to authentication
 */

const User = require("../models/userModel");
const BaseRepository = require("./baseRepository");
const crypto = require("crypto");

/**
 * Repository for authentication-related database operations
 * @extends BaseRepository
 */
class AuthRepository extends BaseRepository {
  /**
   * Create a new AuthRepository instance
   */
  constructor() {
    super(User);
  }

  /**
   * Find a user by email
   * @param {string} email - The email to search for
   * @returns {Promise<User|null>} The user or null if not found
   */
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find a user by email with password field
   * @param {string} email - The email to search for
   * @returns {Promise<User|null>} The user including password field or null if not found
   */
  async findUserByEmailWithPassword(email) {
    try {
      return await User.findOne({ email }).select("+password");
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Update a user's verification status
   * @param {string} userId - The ID of the user to update
   * @returns {Promise<User>} The updated user
   */
  async verifyEmail(userId) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          isEmailVerified: true,
          emailVerificationToken: undefined,
          emailVerificationTokenExpires: undefined,
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error verifying email: ${error.message}`);
    }
  }

  /**
   * Update a user's password
   * @param {string} userId - The ID of the user to update
   * @param {string} newPassword - The new password
   * @returns {Promise<User>} The updated user
   */
  async updatePassword(userId, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.password = newPassword;
      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;

      return await user.save();
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }



  /**
   * Set an email verification token for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<{user: User, token: string}>} The user and token
   */
  async setEmailVerificationToken(userId) {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      const user = await User.findByIdAndUpdate(
        userId,
        {
          emailVerificationToken: token,
          emailVerificationTokenExpires: expires,
        },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return { user, token };
    } catch (error) {
      throw new Error(
        `Error setting email verification token: ${error.message}`
      );
    }
  }

  /**
   * Set a password reset token for a user
   * @param {string} email - The email of the user
   * @returns {Promise<{user: User, token: string}>} The user and token
   */
  async setPasswordResetToken(email) {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

      const user = await User.findOneAndUpdate(
        { email },
        {
          resetPasswordToken: token,
          resetPasswordTokenExpires: expires,
        },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return { user, token };
    } catch (error) {
      throw new Error(`Error setting password reset token: ${error.message}`);
    }
  }
}

module.exports = new AuthRepository();
