/**
 * @fileoverview Controller for KYC operations (admin)
 */

const kycService = require("../../services/kycService");
const userService = require("../../services/userService");

class KycController {
  /**
   * Display KYC management page
   */
  static async showKycPage(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        kycStatus = "",
        view = "applications",
      } = req.query;

      // Get KYC stats for display
      const usersByKycStatus = await kycService.getKycStatusStats();
      const totalUsers = usersByKycStatus.total;

      // Get KYC settings
      const kycSettings = await kycService.getKycSettings();

      let data;

      // Determine which data to fetch based on view parameter
      if (view === "users") {
        // Get users with KYC status
        data = await kycService.getUsersWithKycStatus({
          page,
          limit,
          search,
          kycStatus,
        });
      } else {
        // Get KYC applications
        data = await kycService.getAllKycWithPagination({
          page,
          limit,
          search,
          status,
        });
      }

      res.render("adminViews/kyc", {
        title: "KYC Management",
        data,
        usersByKycStatus,
        currentPage: parseInt(page),
        totalUsers,
        search,
        status,
        kycStatus,
        view,
        kycSettings,
      });
    } catch (error) {
      console.error("Error in showKycPage:", error);
      req.flash("error", "Failed to load KYC management page");
      // res.redirect("/admin/dashboard");
    }
  }

  /**
   * Get KYC details by ID
   */
  static async getKycDetails(req, res) {
    try {
      const { id } = req.params;
      const kyc = await kycService.getKycDetails(id);

      if (!kyc) {
        return res.status(404).json({
          success: false,
          message: "KYC application not found",
        });
      }

      res.json({
        success: true,
        data: kyc,
      });
    } catch (error) {
      console.error("Error in getKycDetails:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get KYC details",
      });
    }
  }

  /**
   * Update KYC status
   */
  static async updateKycStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectReason } = req.body;
      const adminId = req.user.id;

      // Validate status
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      // If rejecting, require a reason
      if (status === "rejected" && !rejectReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const updatedKyc = await kycService.updateKycStatus(
        id,
        status,
        adminId,
        rejectReason
      );

      res.json({
        success: true,
        message: `KYC application ${status}`,
        data: updatedKyc,
      });
    } catch (error) {
      console.error("Error in updateKycStatus:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update KYC status",
      });
    }
  }

  /**
   * Get KYC settings
   */
  static async getKycSettings(req, res) {
    try {
      const settings = await kycService.getKycSettings();

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Error in getKycSettings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch KYC settings",
      });
    }
  }

  /**
   * Update KYC settings
   */
  static async updateKycSettings(req, res) {
    try {
      const {
        enableKYCAllUsers,
        enableKYCSingleUser,
        requiredDocuments,
        withdrawalLimitWithoutKYC,
        withdrawalLimitWithKYC,
      } = req.body;

      const adminId = req.user.id;

      // Validate settings
      if (
        withdrawalLimitWithoutKYC === undefined ||
        withdrawalLimitWithKYC === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Withdrawal limits are required",
        });
      }

      const settings = {
        enableKYCAllUsers: !!enableKYCAllUsers,
        enableKYCSingleUser: !!enableKYCSingleUser,
        requiredDocuments: {
          idCard: !!(requiredDocuments && requiredDocuments.idCard),
          passport: !!(requiredDocuments && requiredDocuments.passport),
          utilityBill: !!(requiredDocuments && requiredDocuments.utilityBill),
          selfie: !!(requiredDocuments && requiredDocuments.selfie),
        },
        withdrawalLimitWithoutKYC: parseFloat(withdrawalLimitWithoutKYC),
        withdrawalLimitWithKYC: parseFloat(withdrawalLimitWithKYC),
      };

      const updatedSettings = await kycService.updateKycSettings(
        settings,
        adminId
      );

      res.json({
        success: true,
        message: "KYC settings updated successfully",
        data: updatedSettings,
      });
    } catch (error) {
      console.error("Error in updateKycSettings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update KYC settings",
      });
    }
  }

  /**
   * Set KYC requirement for a specific user
   */
  static async setUserKycRequirement(req, res) {
    try {
      const { userId } = req.params;
      const { required } = req.body;

      if (required === undefined) {
        return res.status(400).json({
          success: false,
          message: "Required parameter is missing",
        });
      }

      // Update user's KYC status
      const kycStatus = required ? "pending" : "not_required";
      const user = await userService.updateUser(userId, { kycStatus });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: `KYC ${required ? "enabled" : "disabled"} for user`,
        data: { userId, kycStatus },
      });
    } catch (error) {
      console.error("Error in setUserKycRequirement:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update user's KYC requirement",
      });
    }
  }
}

module.exports = KycController;
