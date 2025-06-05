/**
 * @description Client-side API functions for managing application settings
 */

/**
 * Get application settings
 * @returns {Promise<Object>} App settings data
 */
async function getAppSettings() {
  try {
    const response = await fetch("/admin/settings/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();    

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch application settings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching app settings:", error);
    throw error;
  }
}

/**
 * Update general application settings
 * @param {Object} settings - Settings data to update
 * @returns {Promise<Object>} Updated settings
 */
async function updateAppSettings(settings) {
  try {
    const response = await fetch("/admin/settings/", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update application settings");
    }

    return data;
  } catch (error) {
    console.error("Error updating app settings:", error);
    throw error;
  }
}

/**
 * Update referral system settings
 * @param {Object} referralSettings - Referral settings data
 * @returns {Promise<Object>} Updated referral settings
 */
async function updateReferralSettings(referralSettings) {
  try {
    const response = await fetch("/admin/settings/referral", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(referralSettings),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update referral settings");
    }

    return data;
  } catch (error) {
    console.error("Error updating referral settings:", error);
    throw error;
  }
}

/**
 * Upload site logo
 * @param {File} file - The logo file to upload
 * @returns {Promise<Object>} Upload result
 */
async function uploadLogo(file) {
  try {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await fetch("/admin/settings/logo", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload logo");
    }

    return data;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }
}

/**
 * Upload site favicon
 * @param {File} file - The favicon file to upload
 * @returns {Promise<Object>} Upload result
 */
async function uploadFavicon(file) {
  try {
    const formData = new FormData();
    formData.append("favicon", file);

    const response = await fetch("/admin/settings/favicon", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload favicon");
    }

    return data;
  } catch (error) {
    console.error("Error uploading favicon:", error);
    throw error;
  }
}

// Helper function to show toast notifications
function showToast(message, type = "success") {
  if (window.iziToast) {
    window.iziToast[type]({
      title: type === "success" ? "Success" : "Error",
      message: message,
      position: "topRight",
    });
  } else {
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

// Expose functions to window object for use in EJS templates
window.getAppSettings = getAppSettings;
window.updateAppSettings = updateAppSettings;
window.updateReferralSettings = updateReferralSettings;
window.uploadLogo = uploadLogo;
window.uploadFavicon = uploadFavicon;
window.showToast = showToast;
