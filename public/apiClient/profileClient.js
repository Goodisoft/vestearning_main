/**
 * ExNestrade Profile API Client
 * Functionality for making profile-related API requests
 */

/**
 * Get user profile data
 * @returns {Promise<Object>} User profile data
 */
async function getUserProfile() {
  try {
    return await apiGet("/user/profile");
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Update user profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
async function updateUserProfile(profileData) {
  try {
    return await apiPut("/user/profile/update", profileData);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @returns {Promise<Object>} Response data
 */
async function changePassword(passwordData) {
  try {
    return await apiPost("/user/password/change", passwordData);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Submit KYC information
 * @param {FormData} formData - Form data with KYC information and documents
 * @returns {Promise<Object>} Response data
 */
async function submitKyc(formData) {
  try {
    const response = await fetch("/user/kyc/submit", {
      method: "POST",
      credentials: "same-origin",
      body: formData, // Using FormData for file uploads
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors
          .map((err) => err.msg || err.message)
          .join(", ");
        throw new Error(
          errorMessages || data.message || "Failed to submit KYC"
        );
      }
      throw new Error(data.message || "Failed to submit KYC");
    }

    return data;
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Get user's KYC status and settings
 * @returns {Promise<Object>} KYC status and required documents
 */
async function getKycStatus() {
  try {
    return await apiGet("/user/kyc/status");
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Get user's notifications
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of notifications per page
 * @returns {Promise<Object>} Notifications data
 */
async function getUserNotifications(page = 1, limit = 10) {
  try {
    return await apiGet(`/user/notifications?page=${page}&limit=${limit}`);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 * @returns {Promise<Object>} Response data
 */
async function markNotificationAsRead(notificationId) {
  try {
    return await apiPatch(`/user/notifications/${notificationId}/read`, {});
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Response data
 */
async function markAllNotificationsAsRead() {
  try {
    return await apiPatch("/user/notifications/read-all", {});
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}
