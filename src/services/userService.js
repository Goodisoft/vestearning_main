/**
 * @fileoverview User service for handling user-related business logic
 */

const userRepository = require("../repositories/userRepository");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const KYC = require("../models/kycModel");

/**
 * Get a user by ID
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function getUserById(userId) {
  try {
    // Get the user from the repository
    const user = await userRepository.findById(userId);

    // Return a safe user object without sensitive information
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      country: user.country,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      withdrawalLimit: user.withdrawalLimit,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments,
      referredBy: user.referredBy,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    };

    return {
      success: true,
      user: safeUser,
      message: "User retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get user: ${error.message}`,
    };
  }
}

/**
 * Update a user's profile
 * @param {string} userId - The ID of the user
 * @param {Object} updateData - Profile data to update
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
async function updateProfile(userId, updateData) {
  try {
    const updatedUser = await userRepository.updateProfile(userId, updateData);

    // Return a safe user object without sensitive information
    const safeUser = {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      country: updatedUser.country,
      withdrawalAddress: updatedUser.withdrawalAddress,
    };

    return {
      success: true,
      user: safeUser,
      message: "Profile updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update profile: ${error.message}`,
    };
  }
}

/**
 * update a user's password
 * @param {string} userId - The ID of the user
 * @param {string} oldPassword - The current password
 * @param {string} newPassword - The new password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function updatePassword(userId, oldPassword, newPassword) {

  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Compare old password with the hashed password in the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log("Password match result:", isMatch); // Fixed: removed the NOT operator

    if (!isMatch) {
      return {
        success: false,
        message: "Old password is incorrect",
      };
    }

    // Hash the new password of the user
    if (newPassword.length < 6) {
      return {
        success: false,
        message: "New password must be at least 6 characters long",
      };
    }
    if (newPassword === oldPassword) {
      // Fixed: typo in parameter name
      return {
        success: false,
        message: "New password must be different from the old password",
      };
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("Hashed new password:", hashedPassword);

    // Update the password in the database
    await userRepository.updatePassword(userId, hashedPassword);
    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update password: ${error.message}`,
    };
  }
}

/**
 * Submit KYC information for a user
 * @param {string} userId - The ID of the user
 * @param {Object} kycData - KYC information and documents
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitKyc(userId, kycData) {
  try {
    // Prepare document objects
    const documentObjects = [];
    if (kycData.documents && kycData.documents.length > 0) {
      for (const docPath of kycData.documents) {
        documentObjects.push({
          documentType: kycData.documentType,
          documentUrl: docPath,
          dob: kycData.dob || "",
          phoneNumber: kycData.phoneNumber || "",
        });
      }
    }

    // Check if user already has a KYC record
    let kycRecord = await KYC.findOne({ user: userId });

    if (kycRecord) {
      // Update existing record
      kycRecord.status = "pending";
      kycRecord.documents = documentObjects;
      kycRecord.requestedAt = new Date();
      await kycRecord.save();
    } else {
      // Create new KYC record
      kycRecord = new KYC({
        user: userId,
        status: "pending",
        documents: documentObjects,
        requestedAt: new Date(),
      });
      await kycRecord.save();
    }

    // Also update user's KYC status in the user model for backward compatibility
    await userRepository.updateKycStatus(userId, "pending");

    // Add documents to user model for backward compatibility
    // if (kycData.documents && kycData.documents.length > 0) {
    //   for (const docPath of kycData.documents) {
    //     await userRepository.addKycDocument(userId, {
    //       documentType: kycData.documentType,
    //       documentPath: docPath,
    //       uploadedAt: new Date(),
    //     });
    //   }
    // }

    return {
      success: true,
      message: "KYC documents submitted successfully and pending review",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to submit KYC: ${error.message}`,
    };
  }
}

// Count the numbers of users
async function countUsers() {
  try {
    const totalUsers = await userRepository.countAllDocuments();
    return {
      success: true,
      totalUsers,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to count users: ${error.message}`,
    };
  }
}

module.exports = {
  getUserById,
  updateProfile,
  updatePassword,
  submitKyc,
  countUsers,
};
