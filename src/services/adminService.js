/**
 * @fileoverview Admin service for handling admin-related business logic
 */
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const userService = require("./userService");
const planRepository = require("../repositories/planRepository");
const userRepository = require("../repositories/userRepository");
const { log } = require("console");

/**
 * Get user details by ID with wallet information
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function getUserDetailsWithWallet(userId) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    // Get user details using the existing userService
    const userResponse = await userService.getUserById(userId);

    if (!userResponse.success) {
      return userResponse;
    }

    // Get wallet details
    const wallet = await Wallet.findOne({ user: userId });

    // Return comprehensive user details
    return {
      success: true,
      user: {
        ...userResponse.user,
        wallet: wallet ? wallet.toJSON() : null,
      },
      message: "User details retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get user details: ${error.message}`,
    };
  }
}

/**
 * Get all users with optional filters
 * @param {Object} filters - Filters to apply (status, role)
 * @returns {Promise<{success: boolean, users?: Array<Object>, count?: number, message: string}>}
 */
async function getUsers(filters = {}) {
  try {
    const { status, role } = filters;
    let queryFilter = {};

    // Apply filters based on status
    if (status === "active") {
      queryFilter = { isEmailVerified: true, isBlocked: false };
    } else if (status === "inactive") {
      queryFilter = { isEmailVerified: false };
    } else if (status === "suspended") {
      queryFilter = { isBlocked: true };
    }

    // Apply role filter if provided
    if (role) {
      queryFilter.role = role;
    }

    // Find users with the applied filters
    const users = await User.find(queryFilter)
      .select("fullName email country isEmailVerified isBlocked createdAt")
      .sort({ createdAt: -1 });

    return {
      success: true,
      users,
      count: users.length,
      message: "Users retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch users: ${error.message}`,
    };
  }
}

/**
 * Get paginated users with filters
 * @param {Object} filters - Filters to apply (status, role)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<{success: boolean, users?: Array<Object>, count?: number, totalPages?: number, currentPage?: number, message: string}>}
 */
async function getPaginatedUsers(filters = {}, page = 1, limit = 10) {
  try {
    const { status, role } = filters;
    let queryFilter = {};

    // Apply filters based on status
    if (status === "active") {
      queryFilter = { isEmailVerified: true, isBlocked: false };
    } else if (status === "inactive") {
      queryFilter = { isEmailVerified: false };
    } else if (status === "suspended") {
      queryFilter = { isBlocked: true };
    }

    // Apply role filter if provided
    if (role) {
      queryFilter.role = role;
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Count total users matching the filter
    const totalCount = await User.countDocuments(queryFilter);

    // Find users with the applied filters and pagination
    const users = await User.find(queryFilter)
      .select("fullName email country isEmailVerified isBlocked role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      users,
      count: totalCount,
      totalPages,
      currentPage: page,
      message: "Users retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch users: ${error.message}`,
    };
  }
}

/**
 * Update a user's withdrawal limit
 * @param {string} userId - The ID of the user
 * @param {number} limit - New withdrawal limit
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function updateWithdrawalLimit(userId, limit) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    if (typeof limit !== "number" || isNaN(limit) || limit < 0) {
      return {
        success: false,
        message: "Valid withdrawal limit is required",
      };
    }

    // Update the user's withdrawal limit
    const user = await User.findByIdAndUpdate(
      userId,
      { withdrawalLimit: limit },
      { new: true }
    ).select("-password");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user,
      message: "Withdrawal limit updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update withdrawal limit: ${error.message}`,
    };
  }
}

/**
 * Update a user's KYC status
 * @param {string} userId - The ID of the user
 * @param {string} status - New KYC status ('pending', 'approved', 'rejected', 'not_required')
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function updateKycStatus(userId, status) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    if (
      !status ||
      !["approved", "rejected", "pending", "not_required"].includes(status)
    ) {
      return {
        success: false,
        message:
          "Valid KYC status is required (approved, rejected, pending, not_required)",
      };
    }

    // Update the user's KYC status
    const user = await User.findByIdAndUpdate(
      userId,
      { kycStatus: status },
      { new: true }
    ).select("-password");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user,
      message: "KYC status updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update KYC status: ${error.message}`,
    };
  }
}

/**
 * Toggle a user's block status
 * @param {string} userId - The ID of the user
 * @param {boolean} blocked - Whether to block (true) or unblock (false)
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function toggleBlockStatus(userId, blocked) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    if (typeof blocked !== "boolean") {
      return {
        success: false,
        message: "Block status must be a boolean",
      };
    }

    // Update the user's block status
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: blocked },
      { new: true }
    ).select("-password");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user,
      message: blocked
        ? "User blocked successfully"
        : "User unblocked successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update block status: ${error.message}`,
    };
  }
}

/**
 * Toggle admin status for a user
 * @param {string} userId - The ID of the user
 * @param {boolean} isAdmin - Whether to make admin (true) or remove admin status (false)
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function toggleAdminStatus(userId, isAdmin) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    if (typeof isAdmin !== "boolean") {
      return {
        success: false,
        message: "Admin status must be a boolean",
      };
    }

    const role = isAdmin ? "admin" : "user";

    // Update the user's role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user,
      message: isAdmin
        ? "User promoted to admin successfully"
        : "Admin demoted to user successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update admin status: ${error.message}`,
    };
  }
}

/**
 * Send email to multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<{success: boolean, count?: number, message: string}>}
 */
async function sendBulkEmail(userIds, subject, message) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        message: "At least one user ID is required",
      };
    }

    if (!subject || !message) {
      return {
        success: false,
        message: "Email subject and message are required",
      };
    }

    // Get users' email addresses
    const users = await User.find({ _id: { $in: userIds } }).select("email");

    if (users.length === 0) {
      return {
        success: false,
        message: "No valid users found",
      };
    }

    const emailService = require("../utils/emailService");
    const emails = users.map((user) => user.email);

    // Add a custom method for bulk email to emailService
    const customSendEmail = async (emails, subject, message) => {
      try {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Send email to multiple recipients
        const mailOptions = {
          from: process.env.EMAIL_USER,
          bcc: emails, // Use BCC to hide recipients from each other
          subject,
          html: message,
        };

        await transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
        throw new Error(`Error sending bulk email: ${error.message}`);
      }
    };

    await customSendEmail(emails, subject, message);

    return {
      success: true,
      count: emails.length,
      message: `Email sent successfully to ${emails.length} users`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    };
  }
}

/**
 * Send investment plan invitations to users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} planId - ID of the investment plan
 * @returns {Promise<{success: boolean, count?: number, message: string}>}
 */
async function sendPlanInvitation(userIds, planId) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        message: "At least one user ID is required",
      };
    }

    if (!planId) {
      return {
        success: false,
        message: "Plan ID is required",
      };
    }

    // Get the plan details
    const plan = await planRepository.findById(planId);

    if (!plan) {
      return {
        success: false,
        message: "Investment plan not found",
      };
    }

    // Get users' email addresses
    const users = await User.find({ _id: { $in: userIds } }).select(
      "email fullName"
    );

    if (users.length === 0) {
      return {
        success: false,
        message: "No valid users found",
      };
    }

    const ejs = require("ejs");
    const path = require("path");
    const emailService = require("../utils/emailService");

    // Render a custom email template for plan invitation
    const templatePath = path.join(
      __dirname,
      "../utils/templates/planInvitationTemplate.ejs"
    );

    // Process each user
    for (const user of users) {
      try {
        // Uppdate the user's plan status
        await userRepository.update(user._id, { inviteToInvest: "invited" });

        // Generate a custom URL for the user to view the plan
        const planUrl = `${process.env.BASE_URL}/user/plans?highlight=${plan._id}`;

        // Render the email template with personalized data
        const emailHtml = await ejs.renderFile(templatePath, {
          userName: user.fullName,
          planName: plan.name,
          planType: plan.type,
          minAmount: plan.minAmount,
          maxAmount: plan.maxAmount,
          roi: plan.roiPercentage,
          duration: `${plan.term} ${plan.termPeriod}`,
          planUrl,
        });

        // Send the email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Special Investment Opportunity: ${plan.name}`,
          html: emailHtml,
        };

        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error(
          `Failed to send invitation to ${user.email}: ${error.message}`
        );
      }
    }

    return {
      success: true,
      count: users.length,
      message: `Investment plan invitation sent to ${users.length} users`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send plan invitation: ${error.message}`,
    };
  }
}

/**
 * Toggle block status for multiple users at once
 * @param {Array<string>} userIds - Array of user IDs
 * @param {boolean} blocked - Whether to block or unblock users
 * @returns {Promise<{success: boolean, count?: number, message: string}>}
 */
async function bulkToggleBlockStatus(userIds, blocked) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        message: "At least one user ID is required",
      };
    }

    if (typeof blocked !== "boolean") {
      return {
        success: false,
        message: "Block status must be a boolean value",
      };
    }

    // Update the block status for all specified users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isBlocked: blocked } }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "No users found with the provided IDs",
      };
    }

    return {
      success: true,
      count: result.modifiedCount,
      message: blocked
        ? `Successfully blocked ${result.modifiedCount} users`
        : `Successfully unblocked ${result.modifiedCount} users`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update block status: ${error.message}`,
    };
  }
}

/**
 * Toggle admin status for multiple users at once
 * @param {Array<string>} userIds - Array of user IDs
 * @param {boolean} isAdmin - Whether to make users admins or regular users
 * @returns {Promise<{success: boolean, count?: number, message: string}>}
 */
async function bulkToggleAdminStatus(userIds, isAdmin) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        message: "At least one user ID is required",
      };
    }

    if (typeof isAdmin !== "boolean") {
      return {
        success: false,
        message: "Admin status must be a boolean value",
      };
    }

    const role = isAdmin ? "admin" : "user";

    // Update the role for all specified users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "No users found with the provided IDs",
      };
    }

    return {
      success: true,
      count: result.modifiedCount,
      message: isAdmin
        ? `Successfully promoted ${result.modifiedCount} users to admin`
        : `Successfully demoted ${result.modifiedCount} users to regular users`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update admin status: ${error.message}`,
    };
  }
}

/**
 * Get a simplified list of all users for dropdown menus
 * @returns {Promise<{success: boolean, users?: Array<Object>, message: string}>}
 */
async function getSimplifiedUsersList() {
  try {
    // Get only the necessary user fields for dropdown display
    const users = await User.find({})
      .select("_id fullName email")
      .sort({ fullName: 1 });

    return {
      success: true,
      users,
      message: "Users list retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch users list: ${error.message}`,
    };
  }
}

/**
 * Update a user's personal information
 * @param {string} userId - The ID of the user
 * @param {Object} userData - User data to update
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function updateUserPersonalInfo(userId, userData) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      "fullName",
      "country",
      "email",
      "isEmailVerified",
    ];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    });

    // Handle password update separately
    if (userData.password) {
      const bcrypt = require("bcryptjs");
      if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(userData.password)) {
        return {
          success: false,
          message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        };
      }
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: "No valid fields to update",
      };
    }

    // Update the user's personal information
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user,
      message: "User information updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update user information: ${error.message}`,
    };
  }
}

/**
 * Update a user's wallet information
 * @param {string} userId - The ID of the user
 * @param {Object} walletData - Wallet data to update
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function updateUserWallet(userId, walletData) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    // Find the user's wallet
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return {
        success: false,
        message: "Wallet not found for this user",
      };
    }

    // Only allow specific fields to be updated
    const allowedFields = ["walletBalance", "referralBalance"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (walletData[field] !== undefined) {
        // Convert to number and validate
        const value = Number(walletData[field]);
        if (!isNaN(value) && value >= 0) {
          updateData[field] = value;
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: "No valid fields to update",
      };
    }

    // Update the wallet
    wallet = await Wallet.findOneAndUpdate({ user: userId }, updateData, {
      new: true,
    });

    return {
      success: true,
      wallet,
      message: "Wallet information updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update wallet information: ${error.message}`,
    };
  }
}

/**
 * Add or update withdrawal address for a user
 * @param {string} userId - The ID of the user
 * @param {Object} addressData - Withdrawal address data
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function updateWithdrawalAddress(userId, addressData) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    if (
      !addressData ||
      !addressData.currency ||
      !addressData.address ||
      !addressData.network
    ) {
      return {
        success: false,
        message: "Address currency, network, and address are required",
      };
    }

    // Find the user's wallet
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return {
        success: false,
        message: "Wallet not found for this user",
      };
    }

    // Check if an address for this currency/network already exists
    const addressIndex = wallet.withdrawalAddresses.findIndex(
      (addr) =>
        addr.currency === addressData.currency &&
        addr.network === addressData.network
    );

    if (addressIndex >= 0) {
      // Update existing address
      wallet.withdrawalAddresses[addressIndex] = {
        ...wallet.withdrawalAddresses[addressIndex],
        ...addressData,
      };
    } else {
      // Add new address
      wallet.withdrawalAddresses.push(addressData);
    }

    await wallet.save();

    return {
      success: true,
      wallet,
      message: "Withdrawal address updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update withdrawal address: ${error.message}`,
    };
  }
}

/**
 * Delete a withdrawal address from a user's wallet
 * @param {string} userId - The ID of the user
 * @param {string} addressId - The ID of the address to delete
 * @returns {Promise<{success: boolean, wallet?: Object, message: string}>}
 */
async function deleteWithdrawalAddress(userId, addressId) {
  try {
    if (!userId || !addressId) {
      return {
        success: false,
        message: "User ID and address ID are required",
      };
    }

    // Find the user's wallet and pull the address from the array
    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      { $pull: { withdrawalAddresses: { _id: addressId } } },
      { new: true }
    );

    if (!wallet) {
      return {
        success: false,
        message: "Wallet not found for this user",
      };
    }

    return {
      success: true,
      wallet,
      message: "Withdrawal address deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete withdrawal address: ${error.message}`,
    };
  }
}

module.exports = {
  getUserDetailsWithWallet,
  getUsers,
  getPaginatedUsers,
  updateWithdrawalLimit,
  updateKycStatus,
  toggleBlockStatus,
  toggleAdminStatus,
  bulkToggleBlockStatus,
  bulkToggleAdminStatus,
  sendBulkEmail,
  sendPlanInvitation,
  getSimplifiedUsersList,
  updateUserPersonalInfo,
  updateUserWallet,
  updateWithdrawalAddress,
  deleteWithdrawalAddress,
};
