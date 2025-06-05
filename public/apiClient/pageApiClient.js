/**
 * Page API Client - Handles frontend API requests for pages
 * Used to fetch plan data and app settings
 */

const API_BASE_URL = "/api";

class PageApiClient {
  /**
   * Fetches all active plans from the server
   * @returns {Promise<Array>} Array of plan objects
   */
  static async getActivePlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/plans/active`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active plans");
      }

      const data = await response.json();
      return data.plans || [];
    } catch (error) {
      console.error("Error fetching active plans:", error);
      return [];
    }
  }

  /**
   * Fetches application settings from the server
   * @returns {Promise<Object>} App settings object
   */
  static async getAppSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch app settings");
      }

      const data = await response.json();
      return data.settings || {};
    } catch (error) {
      console.error("Error fetching app settings:", error);
      return {};
    }
  }
}

// Export the PageApiClient for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = PageApiClient;
}
