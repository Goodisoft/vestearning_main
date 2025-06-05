/**
 * Transaction API Client for EXNESTRADE Admin Panel
 * Provides methods to interact with the transaction API endpoints
 */

class TransactionClient {
  /**
   * Get pending investments with optional filters
   * @param {Object} filters - Filter options
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated list of pending investments
   */
  static async getPendingInvestments(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      });

      const response = await fetch(`/admin/transactions/api/pending?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching pending investments:", error);
      return {
        success: false,
        message: "Failed to fetch pending investments. Please try again."
      };
    }
  }

  /**
   * Get active investments with optional filters
   * @param {Object} filters - Filter options
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated list of active investments
   */
  static async getActiveInvestments(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      });

      const response = await fetch(`/admin/transactions/api/active?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching active investments:", error);
      return {
        success: false,
        message: "Failed to fetch active investments. Please try again."
      };
    }
  }

  /**
   * Get investment details by ID
   * @param {string} investmentId - The ID of the investment
   * @returns {Promise<Object>} Investment details
   */
  static async getInvestmentDetails(investmentId) {
    try {
      const response = await fetch(`/admin/transaction/api/investments/${investmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error fetching investment details:", error);
      return {
        success: false,
        message: "Failed to fetch investment details. Please try again."
      };
    }
  }

  /**
   * Update investment details
   * @param {string} investmentId - The ID of the investment
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated investment
   */
  static async updateInvestmentDetails(investmentId, updateData) {
    try {
      const response = await fetch(`/admin/transaction/api/investments/${investmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      return await response.json();
    } catch (error) {
      console.error("Error updating investment details:", error);
      return {
        success: false,
        message: "Failed to update investment details. Please try again."
      };
    }
  }

  /**
   * Confirm an investment
   * @param {string} investmentId - The ID of the investment
   * @returns {Promise<Object>} Confirmation result
   */
  static async confirmInvestment(investmentId) {
    try {
      const response = await fetch(`/admin/transaction/api/investments/${investmentId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("Error confirming investment:", error);
      return {
        success: false,
        message: "Failed to confirm investment. Please try again."
      };
    }
  }

  /**
   * Cancel an investment
   * @param {string} investmentId - The ID of the investment
   * @param {string} reason - The reason for cancellation
   * @returns {Promise<Object>} Cancellation result
   */
  static async cancelInvestment(investmentId, reason = "") {
    try {
      const response = await fetch(`/admin/transaction/api/investments/${investmentId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error cancelling investment:", error);
      return {
        success: false,
        message: "Failed to cancel investment. Please try again."
      };
    }
  }}