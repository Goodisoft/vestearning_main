/**
 * ExNestrade Admin Withdrawal API Client
 * Handles all admin-specific withdrawal-related API operations
 */

/**
 * Approve a pending withdrawal
 * @param {string} withdrawalId - The withdrawal ID to approve
 * @param {string} txHash - Optional transaction hash for the blockchain transaction
 */
async function approveWithdrawal(withdrawalId, txHash = null) {
  if (!confirm("Are you sure you want to approve this withdrawal?")) {
    return;
  }

  // Show loading state
  document.body.style.cursor = "wait";

  try {
    const response = await apiPost(
      `/admin/transaction/api/withdrawals/${withdrawalId}/approve`,
      { txHash }
    );

    if (response.success) {
      showToast("Withdrawal approved successfully", "success");

      // Hide any open modals
      const detailsModal = bootstrap.Modal.getInstance(
        document.getElementById("tranxDetails")
      );
      if (detailsModal) {
        detailsModal.hide();
      }

      // Reload the page to refresh the withdrawals list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showToast("Error: " + response.message, "error");
    }
  } catch (error) {
    showToast("An error occurred: " + error.message, "error");
  } finally {
    document.body.style.cursor = "default";
  }
}

/**
 * Cancel a pending withdrawal
 * @param {string} withdrawalId - The withdrawal ID to cancel
 */
async function cancelWithdrawal(withdrawalId) {
  // Create a modal for rejection reason
  const rejectModal = document.createElement("div");
  rejectModal.className = "modal fade";
  rejectModal.id = "rejectReasonModal";
  rejectModal.setAttribute("tabindex", "-1");
  rejectModal.setAttribute("aria-hidden", "true");

  rejectModal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cancellation Reason</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Please provide a reason for cancelling this withdrawal (optional)</label>
            <textarea class="form-control" id="cancellationReason" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Back</button>
          <button type="button" class="btn btn-danger" id="confirmCancelBtn">Cancel Withdrawal</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(rejectModal);

  // Show the modal
  const bsModal = new bootstrap.Modal(
    document.getElementById("rejectReasonModal")
  );
  bsModal.show();

  // Add event listener to the confirm button
  document
    .getElementById("confirmCancelBtn")
    .addEventListener("click", async function () {
      const reason = document.getElementById("cancellationReason").value.trim();

      // Close the modal
      bsModal.hide();

      // Show loading state
      document.body.style.cursor = "wait";

      try {
        const response = await apiPost(
          `/admin/transaction/api/withdrawals/${withdrawalId}/cancel`,
          { reason }
        );

        if (response.success) {
          showToast("Withdrawal cancelled successfully", "success");

          // Hide any open modals
          const detailsModal = bootstrap.Modal.getInstance(
            document.getElementById("tranxDetails")
          );
          if (detailsModal) {
            detailsModal.hide();
          }

          // Reload the page to refresh the withdrawals list
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showToast("Error: " + response.message, "error");
        }
      } catch (error) {
        showToast("An error occurred: " + error.message, "error");
      } finally {
        document.body.style.cursor = "default";

        // Remove the modal from DOM after it's been hidden
        document
          .getElementById("rejectReasonModal")
          .addEventListener("hidden.bs.modal", function () {
            document.body.removeChild(rejectModal);
          });
      }
    });
}

/**
 * View withdrawal details
 * @param {string} withdrawalId - The withdrawal ID to view
 */
async function viewWithdrawalDetails(withdrawalId) {
  try {
    // Get withdrawal ID from the DOM if not provided (for events)
    if (!withdrawalId) {
      withdrawalId = this.getAttribute("data-id");
    }

    // Fetch withdrawal details from API
    const response = await apiGet(
      `/admin/transaction/api/withdrawals/${withdrawalId}`
    );

    if (response.success) {
      const withdrawal = response.withdrawal;
      const user = withdrawal.userId;

      // Set transaction ID in modal
      document.querySelector(".transaction-id").textContent = withdrawal._id;

      // Set withdrawal amount
      const amountElement = document.querySelector(".transaction-amount");
      if (amountElement) {
        amountElement.textContent = `- ${withdrawal.amount.toFixed(2)} ${
          withdrawal.currency
        }`;
      }

      // Set withdrawal status badge
      const statusBadge = document.querySelector(".transaction-status");
      if (statusBadge) {
        let badgeClass = "bg-warning";
        if (withdrawal.status === "completed") badgeClass = "bg-success";
        if (withdrawal.status === "cancelled" || withdrawal.status === "failed")
          badgeClass = "bg-danger";

        statusBadge.className = `btn ${badgeClass}`;
        statusBadge.textContent = withdrawal.status;
      }

      // Set user details
      const userAccountElement = document.querySelector(".user-account");
      if (userAccountElement) {
        userAccountElement.textContent = user ? user.fullName : "Unknown User";
      }

      const usernameElement = document.querySelector(".username");
      if (usernameElement) {
        usernameElement.textContent = user ? user.username : "Unknown";
      }

      // Set transaction details
      const txIdElement = document.querySelector(".transaction-id-value");
      if (txIdElement) {
        txIdElement.textContent = withdrawal._id;
      }

      const txHashElement = document.querySelector(".transaction-hash-value");
      if (txHashElement) {
        txHashElement.textContent = withdrawal.txHash || "Not available yet";
      }

      const txFeeElement = document.querySelector(".transaction-fee-value");
      if (txFeeElement) {
        txFeeElement.textContent = "0.00 USD"; // Update if you track fees
      }

      const amountDetailElement = document.querySelector(".amount-value");
      if (amountDetailElement) {
        amountDetailElement.textContent = `${withdrawal.amount.toFixed(2)} ${
          withdrawal.currency
        }`;
      }

      // Set transaction type
      const txTypeElement = document.querySelector(".transaction-type-value");
      if (txTypeElement) {
        txTypeElement.textContent =
          withdrawal.type === "wallet"
            ? "Wallet Withdrawal"
            : "Referral Withdrawal";
      }

      // Set wallet address
      const walletAddressElement = document.querySelector(
        ".wallet-address-value"
      );
      if (walletAddressElement) {
        walletAddressElement.textContent = withdrawal.walletAddress;
      }

      // Update confirm button action with proper withdrawal ID if status is pending
      if (withdrawal.status === "pending") {
        // Show action buttons
        document.querySelectorAll(".withdrawal-action-btn").forEach((el) => {
          el.style.display = "";
        });

        // Set data-id attribute for buttons
        document.querySelectorAll(".btn-approve-withdrawal").forEach((btn) => {
          btn.setAttribute("data-id", withdrawal._id);
          btn.onclick = function () {
            const id = this.getAttribute("data-id");
            // Close modal first
            bootstrap.Modal.getInstance(
              document.getElementById("tranxDetails")
            ).hide();
            // Show transaction hash input modal
            showTxHashInputModal(id);
          };
        });

        document.querySelectorAll(".btn-cancel-withdrawal").forEach((btn) => {
          btn.setAttribute("data-id", withdrawal._id);
          btn.onclick = function () {
            cancelWithdrawal(this.getAttribute("data-id"));
          };
        });
      } else {
        // Hide action buttons for non-pending withdrawals
        document.querySelectorAll(".withdrawal-action-btn").forEach((el) => {
          el.style.display = "none";
        });
      }
    } else {
      showToast("Error: " + response.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("An error occurred while fetching withdrawal details", "error");
  }
}

/**
 * Show transaction hash input modal
 * @param {string} withdrawalId - The withdrawal ID to approve
 */
function showTxHashInputModal(withdrawalId) {
  // Create a modal for transaction hash input
  const txHashModal = document.createElement("div");
  txHashModal.className = "modal fade";
  txHashModal.id = "txHashInputModal";
  txHashModal.setAttribute("tabindex", "-1");
  txHashModal.setAttribute("aria-hidden", "true");

  txHashModal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Transaction Hash (Optional)</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Enter the blockchain transaction hash (if available)</label>
            <input type="text" class="form-control" id="txHashInput" placeholder="e.g., 0x1234...">
            <small class="text-muted">Leave blank to use an auto-generated reference</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="confirmApproveBtn">Approve Withdrawal</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(txHashModal);

  // Show the modal
  const bsModal = new bootstrap.Modal(
    document.getElementById("txHashInputModal")
  );
  bsModal.show();

  // Add event listener to the confirm button
  document
    .getElementById("confirmApproveBtn")
    .addEventListener("click", async function () {
      const txHash = document.getElementById("txHashInput").value.trim();

      // Close the modal
      bsModal.hide();

      // Call the approve function
      await approveWithdrawal(withdrawalId, txHash);

      // Remove the modal from DOM after it's been hidden
      document
        .getElementById("txHashInputModal")
        .addEventListener("hidden.bs.modal", function () {
          document.body.removeChild(txHashModal);
        });
    });
}

/**
 * Apply filter to withdrawals list
 */
function applyWithdrawalFilter() {
  // Get filter values
  const status = document.getElementById("filterStatus").value;
  const type = document.getElementById("filterType").value;
  const dateRange = document.getElementById("filterDateRange").value;

  let queryParams = [];

  // Add status and type parameters
  if (status && status !== "any") queryParams.push(`status=${status}`);
  if (type && type !== "any") queryParams.push(`type=${type}`);

  // Add date range parameters if present
  if (dateRange) {
    const dateParts = dateRange.split(" - ");
    if (dateParts.length === 2) {
      queryParams.push(`startDate=${dateParts[0]}`);
      queryParams.push(`endDate=${dateParts[1]}`);
    }
  }

  // Preserve existing limit if set
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("limit")) {
    queryParams.push(`limit=${urlParams.get("limit")}`);
  }

  // Build the query string and redirect
  const queryString = queryParams.length > 0 ? "?" + queryParams.join("&") : "";
  window.location.href = window.location.pathname + queryString;
}

/**
 * Reset withdrawal filters
 */
function resetWithdrawalFilter() {
  window.location.href = window.location.pathname;
}

/**
 * Search withdrawals
 */
function searchWithdrawals() {
  const searchInput = document.getElementById("searchInput").value.trim();

  if (searchInput) {
    // Preserve existing limit if set
    const urlParams = new URLSearchParams(window.location.search);
    let queryParams = [`search=${searchInput}`];

    if (urlParams.has("limit")) {
      queryParams.push(`limit=${urlParams.get("limit")}`);
    }

    window.location.href =
      window.location.pathname + "?" + queryParams.join("&");
  }
}

/**
 * Initialize withdrawal management page functionality
 */
function initWithdrawalPage() {
  // Add event listeners once DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    // View withdrawal details buttons
    const detailButtons = document.querySelectorAll(".view-withdrawal-details");
    detailButtons.forEach((button) => {
      button.addEventListener("click", function () {
        viewWithdrawalDetails(this.getAttribute("data-id"));
      });
    });

    // Quick approve withdrawal buttons
    const approveButtons = document.querySelectorAll(
      ".quick-approve-withdrawal"
    );
    approveButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const id = this.getAttribute("data-id");
        showTxHashInputModal(id);
      });
    });

    // Quick cancel withdrawal buttons
    const cancelButtons = document.querySelectorAll(".quick-cancel-withdrawal");
    cancelButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        cancelWithdrawal(this.getAttribute("data-id"));
      });
    });

    // Apply withdrawal filter
    const applyFilterButton = document.getElementById("applyFilter");
    if (applyFilterButton) {
      applyFilterButton.addEventListener("click", applyWithdrawalFilter);
    }

    // Reset withdrawal filter
    const resetFilterButton = document.getElementById("resetFilter");
    if (resetFilterButton) {
      resetFilterButton.addEventListener("click", resetWithdrawalFilter);
    }

    // Search withdrawals
    const searchButton = document.getElementById("searchButton");
    if (searchButton) {
      searchButton.addEventListener("click", searchWithdrawals);
    }

    // Search on enter key
    const searchInputField = document.getElementById("searchInput");
    if (searchInputField) {
      searchInputField.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          searchWithdrawals();
        }
      });
    }
  });
}

// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Initialize admin withdrawal management page
initWithdrawalPage();
