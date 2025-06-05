/**
 * @description Client-side API functions for managing referrals
 */

/**
 * Get all referral earnings
 * @param {Object} filters - Optional query filters
 * @returns {Promise<Object>} List of referral transactions and statistics
 */
async function getReferralEarnings(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/admin/referral/api/earnings${
      queryParams ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch referral earnings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching referral earnings:", error);
    throw error;
  }
}

/**
 * Get user's referral tree
 * @param {string} userId - User ID to get referrals for
 * @param {number} levels - Number of levels to retrieve (default: 3)
 * @returns {Promise<Object>} Referral tree data
 */
async function getReferralTree(userId, levels = 3) {
  try {
    const response = await fetch(
      `/admin/referral/api/tree/${userId}?levels=${levels}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch referral tree");
    }

    return data;
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    throw error;
  }
}

/**
 * Get referral statistics
 * @returns {Promise<Object>} Referral statistics data
 */
async function getReferralStatistics() {
  try {
    const response = await fetch("/admin/referral/api/statistics", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch referral statistics");
    }

    return data;
  } catch (error) {
    console.error("Error fetching referral statistics:", error);
    throw error;
  }
}

/**
 * Get list of all users for dropdown selection
 * @returns {Promise<Object>} Response object
 */
async function getUsersList() {
  try {
    const response = await fetch("/admin/users/api/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Error fetching users list:", error);
    return {
      success: false,
      message: "Failed to fetch users list. Please try again.",
    };
  }
}

/**
 * Update referral needed requirement for a user
 * @param {string} userId - The ID of the user to update
 * @param {number} referralNeeded - Number of referrals needed
 * @returns {Promise<Object>} Updated user data
 */
async function updateReferralNeeded(userId, referralNeeded) {
  try {
    const response = await fetch(`/admin/referral/api/requirement/${userId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralNeeded }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update referral requirement");
    }

    return data;
  } catch (error) {
    console.error("Error updating referral requirement:", error);
    throw error;
  }
}
