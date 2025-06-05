/**
 * ExNestrade API Client
 * Core functionality for making API requests
 */

/**
 * Make a GET request to the API
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object>} Response data
 */
async function apiGet(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "same-origin", // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API GET Error:", error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 * @param {string} url - API endpoint URL
 * @param {Object} body - Request body data
 * @returns {Promise<Object>} Response data
 */
async function apiPost(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "same-origin", // Include cookies
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // If there are validation errors, format them nicely
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors
          .map((err) => err.msg || err.message)
          .join(", ");
        throw new Error(errorMessages || data.message || "API request failed");
      }
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API POST Error:", error);
    throw error;
  }
}

/**
 * Make a PUT request to the API
 * @param {string} url - API endpoint URL
 * @param {Object} body - Request body data
 * @returns {Promise<Object>} Response data
 */
async function apiPut(url, body) {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "same-origin", // Include cookies
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // If there are validation errors, format them nicely
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors
          .map((err) => err.msg || err.message)
          .join(", ");
        throw new Error(errorMessages || data.message || "API request failed");
      }
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API PUT Error:", error);
    throw error;
  }
}

/**
 * Make a PATCH request to the API
 * @param {string} url - API endpoint URL
 * @param {Object} body - Request body data
 * @returns {Promise<Object>} Response data
 */
async function apiPatch(url, body) {
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "same-origin", // Include cookies
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // If there are validation errors, format them nicely
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors
          .map((err) => err.msg || err.message)
          .join(", ");
        throw new Error(errorMessages || data.message || "API request failed");
      }
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API PATCH Error:", error);
    throw error;
  }
}

/**
 * Make a DELETE request to the API
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object>} Response data
 */
async function apiDelete(url) {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "same-origin", // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API DELETE Error:", error);
    throw error;
  }
}

/**
 * Show a notification toast
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = "info", duration = 3000) {
  // Check if iziToast is available
  if (typeof iziToast !== "undefined") {
    iziToast[type]({
      message: message,
      position: "topRight",
      timeout: duration,
    });
    return;
  }

  // Fallback notification
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  const toastContainer =
    document.querySelector(".toast-container") || document.body;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Format a BTC amount for display
 * @param {number} satoshis - Amount in satoshis
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted BTC amount
 */
function formatBTC(satoshis, decimals = 8) {
  return (satoshis / 100000000).toFixed(decimals);
}
