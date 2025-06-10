const fs = require("fs");
const path = require("path");
// services/kycService.js
const kycRepository = require("../repositories/kycRepository");
const userRepository = require("../repositories/userRepository");
const { AppError } = require("../utils/errorHandler");

class KycService {
  /**
   * Create a KYC application
   * @param {Object} kycData - KYC data object
   * @returns {Promise<Object>} Created KYC document
   */
  async createKyc(kycData) {
    try {
      // Check if KYC already exists for this user
      const existingKyc = await kycRepository.findByUserId(kycData.user);

      if (existingKyc) {
        // Update existing KYC instead of creating a new one
        existingKyc.status = "pending";
        existingKyc.requestedAt = new Date();
        existingKyc.documents = kycData.documents || existingKyc.documents;

        // If KYC was previously rejected, clear the rejection reason
        if (existingKyc.status === "rejected") {
          existingKyc.rejectReason = null;
        }

        const updatedKyc = await kycRepository.update(
          existingKyc._id,
          existingKyc
        );

        // Update user's KYC status
        await userRepository.updateUser(kycData.user, { kycStatus: "pending" });

        return updatedKyc;
      }

      // Create new KYC document
      const newKyc = await kycRepository.createKyc(kycData);

      // Update user's KYC status
      await userRepository.updateUser(kycData.user, { kycStatus: "pending" });

      return newKyc;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Find KYC by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} KYC document
   */
  async getKycByUser(userId) {
    try {
      return await kycRepository.findByUserId(userId);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update KYC status
   * @param {string} id - KYC ID
   * @param {string} status - New status
   * @param {string} adminId - Admin ID updating the status
   * @param {string} rejectReason - Optional reason for rejection
   * @returns {Promise<Object>} Updated KYC document
   */
  async updateKycStatus(id, status, adminId, rejectReason = null) {
    try {
      const kyc = await kycRepository.getKycDetails(id);

      if (!kyc) {
        throw new Error("KYC application not found");
      }

      const updatedKyc = await kycRepository.updateStatus(
        id,
        status,
        adminId,
        rejectReason
      );

      // Update user's KYC status as well
      await userRepository.updateKycStatus(kyc.user._id, status);

      // Delete KYC documents if status is approved or rejected
      if (status === "approved" || status === "rejected") {
        try {
          // Check if documents exist and delete them
          if (kyc.documents && kyc.documents.length > 0) {
            kyc.documents.forEach((document) => {
              if (document.path) {
                const filePath = path.join(process.cwd(), document.path);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`Deleted KYC document: ${filePath}`);
                }
              }
            });

            // Clear documents array in database
            await kycRepository.update(id, { documents: [] });
            console.log(`Cleared KYC documents for ID: ${id}`);
          }
        } catch (deleteError) {
          console.error("Error deleting KYC documents:", deleteError);
          // We don't want to fail the whole process if document deletion fails
          // Just log the error and continue
        }
      }

      return updatedKyc;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get all KYC applications with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated KYC data
   */
  async getAllKycWithPagination(options) {
    try {
      const kycData = await kycRepository.getAllKycWithPagination(options);

      // Format dates for display
      kycData.docs = kycData.docs.map((doc) => {
        const formatted = doc.toObject();
        formatted.formattedDate = new Date(
          doc.requestedAt || doc.createdAt
        ).toLocaleDateString();
        return formatted;
      });

      return kycData;
    } catch (error) {
      throw new AppError("Error fetching KYC applications", 500);
    }
  }

  /**
   * Get users with KYC status with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated user data with KYC status
   */
  async getUsersWithKycStatus(options) {
    try {
      const userData = await kycRepository.getUsersWithKycStatus(options);

      // Format dates for display
      userData.docs = userData.docs.map((user) => {
        user.formattedDate = new Date(user.createdAt).toLocaleDateString();
        return user;
      });

      return userData;
    } catch (error) {
      throw new AppError(error, "Error fetching users with KYC status", 500);
    }
  }

  /**
   * Get KYC status stats for dashboard
   * @returns {Promise<Object>} KYC stats
   */
  async getKycStatusStats() {
    try {
      const [pendingCount, approvedCount, rejectedCount, usersWithoutKyc] =
        await Promise.all([
          userRepository.countUsersByKycStatus("pending"),
          userRepository.countUsersByKycStatus("approved"),
          userRepository.countUsersByKycStatus("rejected"),
          userRepository.countUsersByKycStatus("not_required"),
        ]);

      return {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        notRequired: usersWithoutKyc,
        total: pendingCount + approvedCount + rejectedCount + usersWithoutKyc,
      };
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get KYC settings
   * @returns {Promise<Object>} KYC settings
   */
  async getKycSettings() {
    try {
      return await kycRepository.getKycSettings();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update KYC settings
   * @param {Object} settings - Updated settings
   * @param {string} adminId - Admin ID
   * @returns {Promise<Object>} Updated settings
   */
  async updateKycSettings(settings, adminId) {
    try {
      return await kycRepository.updateKycSettings(settings, adminId);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get KYC details by ID
   * @param {string} id - KYC ID
   * @returns {Promise<Object>} KYC document
   */
  async getKycDetails(id) {
    try {
      const kyc = await kycRepository.getKycDetails(id);

      if (!kyc) {
        throw new Error("KYC application not found");
      }

      return kyc;
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}

module.exports = new KycService();
