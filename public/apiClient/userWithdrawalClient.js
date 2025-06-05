/**
 * ExNestrade User Withdrawal Client
 * Handles user withdrawal operations in the frontend
 */

/**
 * Process a wallet withdrawal request
 * @param {Object} data - Withdrawal data
 * @param {number} data.amount - Withdrawal amount
 * @param {string} data.walletAddress - Destination wallet address
 * @param {string} data.currency - Currency being withdrawn
 * @returns {Promise<Object>} API response
 */
async function processWalletWithdrawal(data) {
  try {
    const response = await fetch("/user/api/wallet-withdrawal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const res =  await response.json();

    if (res.success) {
        showToast(res.message || "Operation failed", "success");
        return res;
    } else {
        showToast(res.message || "Operation failed", "error");
    }
  } catch (error) {
    showToast(res.message || "Operation failed", "error");
    return {
      success: false,
      message: "An error occurred while processing your withdrawal request",
    };
  }
}

/**
 * Process a referral earnings withdrawal request
 * @param {Object} data - Withdrawal data
 * @param {number} data.amount - Withdrawal amount
 * @param {string} data.walletAddress - Destination wallet address
 * @param {string} data.currency - Currency being withdrawn
 * @returns {Promise<Object>} API response
 */
async function processReferralWithdrawal(data) {
  try {
    const response = await fetch("/user/api/referral-withdrawal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const res =  await response.json();

    if (res.success) {
        showToast(res.message || "Operation failed", "success");
        return res;
    } else {
        showToast(res.message || "Operation failed", "error");
    }
  } catch (error) {
    showToast("Operation failed", "error");
    return {
      success: false,
      message:
        "An error occurred while processing your referral withdrawal request",
    };
  }
}

/**
 * Cancel a pending withdrawal request
 * @param {string} withdrawalId - ID of the withdrawal to cancel
 * @returns {Promise<Object>} API response
 */
async function cancelWithdrawal(withdrawalId) {
  try {
    const response = await fetch(
      `/user/api/cancel-withdrawal/${withdrawalId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const res =  await response.json();
    if (res.success) {
        showToast(res.message || "Operation failed", "success");
        return res;
    } else {
        showToast(res.message || "Operation failed", "error");
    }
  } catch (error) {
    showToast("Operation failed", "error");
    console.error("Error cancelling withdrawal:", error);
    return {
      success: false,
      message: "An error occurred while cancelling your withdrawal request",
    };
  }
}

/**
 * Save a wallet address for future withdrawals
 * @param {Object} data - Wallet address data
 * @param {string} data.address - Wallet address
 * @param {string} data.currency - Currency (BTC, ETH, etc.)
 * @param {string} data.network - Network type (optional)
 * @param {string} data.label - Label for this address (optional)
 * @returns {Promise<Object>} API response
 */
async function saveWalletAddress(data) {
  try {
    const response = await fetch("/user/api/save-wallet-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res =  await response.json();
    if (res.success) {
        showToast(res.message || "Operation failed", "success");
        return res;
    } else {
        showToast(res.message || "Operation failed", "error");
    }
  } catch (error) {
    showToast("Operation failed", "error");
    console.error("Error saving wallet address:", error);
    return {
      success: false,
      message: "An error occurred while saving your wallet address",
    };
  }
}

/**
 * Get user's withdrawal history
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of items per page
 * @param {string} params.type - Filter by withdrawal type (wallet or referral)
 * @returns {Promise<Object>} API response with withdrawals
 */
async function getWithdrawalHistory(params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.type) queryParams.append("type", params.type);

    const response = await fetch(
      `/user/api/withdrawal-history?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    return {
      success: false,
      message: "An error occurred while fetching your withdrawal history",
    };
  }
}

/**
 * Format currency amount for display
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
function formatCurrency(amount, currency) {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  })} ${currency}`;
}

/**
 * Initialize withdrawal form validation and submission
 * @param {string} formId - ID of the withdrawal form
 * @param {string} submitBtnId - ID of the submit button
 * @param {string} errorMsgId - ID of the error message element
 * @param {Function} processFunc - Function to process the withdrawal
 */
function initWithdrawalForm(formId, submitBtnId, errorMsgId, processFunc) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = document.getElementById(submitBtnId);
    const errorMsg = document.getElementById(errorMsgId);

    // Show loading state
    submitBtn.disabled = true;
    errorMsg.style.display = "none";

    try {
      const formData = new FormData(form);
      const data = {
        amount: formData.get("amount"),
        walletAddress: formData.get("walletAddress"),
        currency: formData.get("currency"),
      };

      const response = await processFunc(data);

      if (response.success) {
        // Show success message
        alert(response.message);

        // Close modal if it exists
        const modalId = form.closest(".modal")?.id;
        if (modalId) {
          const modal = bootstrap.Modal.getInstance(
            document.getElementById(modalId)
          );
          if (modal) modal.hide();
        }

        // Reload page after brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Show error message
        errorMsg.textContent = response.message;
        errorMsg.style.display = "block";
      }
    } catch (error) {
      // Show error message
      errorMsg.textContent = "An unexpected error occurred. Please try again.";
      errorMsg.style.display = "block";
    } finally {
      // Reset button state
      submitBtn.disabled = false;
    }
  });
}

// Export all functions
window.userWithdrawalClient = {
  processWalletWithdrawal,
  processReferralWithdrawal,
  cancelWithdrawal,
  saveWalletAddress,
  getWithdrawalHistory,
  formatCurrency,
  initWithdrawalForm,
};
