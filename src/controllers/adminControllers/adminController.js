const userService = require("../../services/userService");
const adminService = require("../../services/adminService");
const planRepository = require("../../repositories/planRepository");
const transactionService = require("../../services/transactionService");
const walletService = require("../../services/walletService");

class AdminController {
  static async indexPage(req, res) {
    try {
      // We'll only load the page here, actual data will be fetched via API
      return res.render("adminViews/index", {
        error: req.query.error || null,
        success: req.query.success || null,
      });
    } catch (error) {
      console.error("Error in admin dashboard:", error);
      return res.render("adminViews/index", {
        error: "Error loading dashboard data",
      });
    }
  }

  static async activeUsers(req, res) {
    return res.render("adminViews/active_users");
  }

  static async inactiveUsers(req, res) {
    return res.render("adminViews/inactive_users");
  }

  static async suspendedUsers(req, res) {
    return res.render("adminViews/suspended_users");
  }

  static async allUsers(req, res) {
    return res.render("adminViews/all_users");
  }

  static async adminUsers(req, res) {
    return res.render("adminViews/admin_users");
  }

  static async userDetails(req, res) {
    const userId = req.params.id;
    console.log("Fetching user details for ID:", userId);

    if (!userId) {
      return res.redirect("/admin/users/all?error=User ID is required");
    }

    try {
      const userResponse = await adminService.getUserDetailsWithWallet(userId);

      if (!userResponse.success) {
        return res.redirect(
          `/admin/users/all?error=${encodeURIComponent(userResponse.message)}`
        );
      }

      return res.render("adminViews/user_details", {
        user: userResponse.user,
        error: req.query.error || null,
        success: req.query.success || null,
      });
    } catch (error) {
      return res.redirect(
        `/admin/users/all?error=${encodeURIComponent(
          error.message || "Failed to fetch user details"
        )}`
      );
    }
  }

  // API Methods for User Management

  /**
   * Get all users with optional filters via API
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getUsersApi(req, res) {
    try {
      const { status, role, page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const response = await adminService.getPaginatedUsers(
        { status, role },
        pageNum,
        limitNum
      );

      if (!response.success) {
        return res.status(500).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      console.log("Error fetching users:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch users",
      });
    }
  }

  /**
   * Get user details by ID via API
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getUserDetailsApi(req, res) {
    try {
      const userId = req.params.id;
      const response = await adminService.getUserDetailsWithWallet(userId);

      if (!response.success) {
        const statusCode = response.message.includes("not found") ? 404 : 400;
        return res.status(statusCode).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      console.log("Error fetching user details:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch user details",
      });
    }
  }

  /**
   * Update user withdrawal limit via API
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateWithdrawalLimitApi(req, res) {
    try {
      const userId = req.params.id;
      const { limit } = req.body;
      const parsedLimit = parseFloat(limit);

      const response = await adminService.updateWithdrawalLimit(
        userId,
        parsedLimit
      );

      if (!response.success) {
        const statusCode = response.message.includes("not found") ? 404 : 400;
        return res.status(statusCode).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update withdrawal limit",
      });
    }
  }

  /**
   * Update user KYC status via API
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateKycStatusApi(req, res) {
    try {
      const userId = req.params.id;
      const { status } = req.body;

      const response = await adminService.updateKycStatus(userId, status);

      if (!response.success) {
        const statusCode = response.message.includes("not found") ? 404 : 400;
        return res.status(statusCode).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update KYC status",
      });
    }
  }

   /**
     * Update user personal information via API
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async updateUserPersonalInfoApi(req, res) {
      try {
        const userId = req.params.id;
        const userData = req.body;
        
        const response = await adminService.updateUserPersonalInfo(userId, userData);
        
        if (!response.success) {
          const statusCode = response.message.includes("not found") ? 404 : 400;
          return res.status(statusCode).json(response);
        }
        
        return res.status(200).json(response);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to update user information",
        });
      }
    }
    
    /**
     * Update user wallet information via API
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async updateUserWalletApi(req, res) {
      try {
        const userId = req.params.id;
        const walletData = req.body;
        
        const response = await adminService.updateUserWallet(userId, walletData);
        
        if (!response.success) {
          const statusCode = response.message.includes("not found") ? 404 : 400;
          return res.status(statusCode).json(response);
        }
        
        return res.status(200).json(response);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to update wallet information",
        });
      }
    }
    
    /**
     * Add or update withdrawal address via API
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async updateWithdrawalAddressApi(req, res) {
      try {
        const userId = req.params.id;
        const addressData = req.body;
        
        const response = await adminService.updateWithdrawalAddress(userId, addressData);
        
        if (!response.success) {
          const statusCode = response.message.includes("not found") ? 404 : 400;
          return res.status(statusCode).json(response);
        }
        
        return res.status(200).json(response);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to update withdrawal address",
        });
      }
    }
    
    /**
     * Delete withdrawal address via API
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async deleteWithdrawalAddressApi(req, res) {
      try {
        const userId = req.params.id;
        const { addressId } = req.body;
        
        const response = await adminService.deleteWithdrawalAddress(userId, addressId);
        
        if (!response.success) {
          const statusCode = response.message.includes("not found") ? 404 : 400;
          return res.status(statusCode).json(response);
        }
        
        return res.status(200).json(response);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to delete withdrawal address",
        });
      }
    }



  /**
   * Toggle user block status via API
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async toggleBlockStatusApi(req, res) {
    try {
      const userId = req.params.id;
      const { blocked } = req.body;

      const response = await adminService.toggleBlockStatus(userId, blocked);

      if (!response.success) {
        const statusCode = response.message.includes("not found") ? 404 : 400;
        return res.status(statusCode).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update block status",
      });
    }
  }

  //   Get all plans via API
  static async getPlansApi(req, res) {
    try {
      const plans = await planRepository.findActivePlans();
      return res.status(200).json({
        success: true,
        plans,
      });
    } catch (error) {
      console.log("Error fetching plans:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch plans",
      });
    }
  }

  /**
   * Send email to multiple users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async sendEmailApi(req, res) {
    try {
      const { userIds, subject, body } = req.body;
      const message = body;
      if (
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        !subject ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message: "User IDs, subject, and message are required",
        });
      }

      const result = await adminService.sendBulkEmail(
        userIds,
        subject,
        message
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error sending email: ${error.message}`,
      });
    }
  }

  /**
   * Send plan invitation to users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async sendPlanInvitationApi(req, res) {
    try {
      const { userIds, planId } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0 || !planId) {
        return res.status(400).json({
          success: false,
          message: "User IDs and plan ID are required",
        });
      }

      const result = await adminService.sendPlanInvitation(userIds, planId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error sending plan invitation: ${error.message}`,
      });
    }
  }

  /**
   * Bulk toggle block status for users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async bulkToggleBlockStatusApi(req, res) {
    try {
      const { userIds, action } = req.body;
      const blocked = action === "block" ? true : false; 

      if (
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        typeof blocked !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "User IDs array and blocked status are required",
        });
      }

      const result = await adminService.bulkToggleBlockStatus(userIds, blocked);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error toggling block status: ${error.message}`,
      });
    }
  }

  /**
   * Bulk toggle admin status for users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async bulkToggleAdminStatusApi(req, res) {
    try {
      const { userIds, isAdmin } = req.body;

      if (
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        typeof isAdmin !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "User IDs array and admin status are required",
        });
      }

      const result = await adminService.bulkToggleAdminStatus(userIds, isAdmin);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error toggling admin status: ${error.message}`,
      });
    }
  }

  /**
   * Get a simplified list of users for dropdown menus
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getUsersListForDropdown(req, res, next) {
    try {
      // Use the admin service to get simplified user list
      const result = await adminService.getSimplifiedUsersList();

      // Return the users list as JSON
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
