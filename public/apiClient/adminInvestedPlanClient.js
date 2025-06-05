/**
 * ExNestrade Admin Investment API Client
 * Handles all admin-specific investment-related API operations
 */

// Helper function for making API GET requests
async function apiGet(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API GET Error:", error);
    showToast(
      error.message || "An error occurred while fetching data",
      "error"
    );
    throw error;
  }
}

// Helper function for making API POST requests
async function apiPost(endpoint, data = {}) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API POST Error:", error);
    showToast(
      error.message || "An error occurred while submitting data",
      "error"
    );
    throw error;
  }
}

// Helper function for showing toast notifications
function showToast(message, type = "success") {
  if (typeof toastr !== "undefined") {
    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: "toast-top-right",
      timeOut: 5000,
    };
    if (type === "success") toastr.success(message);
    else if (type === "error") toastr.error(message);
    else if (type === "warning") toastr.warning(message);
    else if (type === "info") toastr.info(message);
  } else {
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

/**
 * Get all investments with optional filtering
 * @param {Object} filters - Filter parameters (status, search, page, limit)
 * @returns {Promise<Object>} Response with investments data
 */
async function getInvestments(filters = {}) {
  try {
    // Build query string from filters
    const queryParams = [];
    for (const key in filters) {
      if (filters[key]) {
        queryParams.push(`${key}=${encodeURIComponent(filters[key])}`);
      }
    }

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    const response = await apiGet(`/admin/api/investments${queryString}`);

    return response;
  } catch (error) {
    console.error("Error fetching investments:", error);
    showToast(error.message || "Failed to fetch investments", "error");
    throw error;
  }
}

/**
 * Get active investments with optional filtering
 * @param {Object} filters - Filter parameters (search, page, limit)
 * @returns {Promise<Object>} Response with active investments data
 */
async function getActiveInvestments(filters = {}) {
  return getInvestments({ ...filters, status: "active" });
}

/**
 * Get completed investments with optional filtering
 * @param {Object} filters - Filter parameters (search, page, limit)
 * @returns {Promise<Object>} Response with completed investments data
 */
async function getCompletedInvestments(filters = {}) {
  return getInvestments({ ...filters, status: "completed" });
}

/**
 * Get investment details by ID
 * @param {string} investmentId - The ID of the investment
 * @returns {Promise<Object>} Response with investment details
 */
async function getInvestmentDetails(investmentId) {
  try {
    // Log the request for debugging

    // Make the API request
    const response = await apiGet(
      `/admin/transaction/api/investments/${investmentId}`
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch investment details");
    }

    return response;
  } catch (error) {
    console.error("Error fetching investment details:", error);
    showToast(error.message || "Failed to fetch investment details", "error");
    throw error;
  }
}

/**
 * Confirm a pending investment
 * @param {string} investmentId - The ID of the investment to confirm
 * @returns {Promise<Object>} Response with confirmation result
 */
async function confirmInvestment(investmentId) {
  try {
    const response = await apiPost(
      `/admin/api/investments/${investmentId}/confirm`
    );
    return response;
  } catch (error) {
    console.error("Error confirming investment:", error);
    showToast(error.message || "Failed to confirm investment", "error");
    throw error;
  }
}

/**
 * Cancel an investment
 * @param {string} investmentId - The ID of the investment to cancel
 * @param {string} reason - Optional reason for cancellation
 * @returns {Promise<Object>} Response with cancellation result
 */
async function cancelInvestment(investmentId, reason = "") {
  try {
    const response = await apiPost(
      `/admin/api/investments/${investmentId}/cancel`,
      { reason }
    );
    return response;
  } catch (error) {
    console.error("Error cancelling investment:", error);
    showToast(error.message || "Failed to cancel investment", "error");
    throw error;
  }
}

/**
 * Update investment details
 * @param {string} investmentId - The ID of the investment to update
 * @param {Object} updateData - Data to update (amount, earningRate, duration, etc.)
 * @returns {Promise<Object>} Response with update result
 */
async function updateInvestment(investmentId, updateData) {
  try {
    const response = await fetch(`/admin/api/investments/${investmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating investment:", error);
    showToast(error.message || "Failed to update investment", "error");
    throw error;
  }
}

/**
 * Get investment statistics
 * @returns {Promise<Object>} Response with investment statistics
 */
async function getInvestmentStatistics() {
  try {
    const response = await apiGet("/admin/api/investments/statistics");
    return response;
  } catch (error) {
    console.error("Error fetching investment statistics:", error);
    showToast(
      error.message || "Failed to fetch investment statistics",
      "error"
    );
    throw error;
  }
}

/**
 * Initialize investments table with search, filtering and pagination
 * @param {string} tableId - The ID of the table element
 * @param {string} status - The investment status ('active', 'completed', or undefined for all)
 */
function initInvestmentsTable(tableId, status) {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Set up event listeners for search
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const searchInput = document.getElementById("searchInput");
      if (!searchInput) return;

      const searchValue = searchInput.value.trim();
      applyFilters({ search: searchValue });
    });
  }

  // Add click handler for search button (in case form submission doesn't work)
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", function (e) {
      e.preventDefault();
      const searchInput = document.getElementById("searchInput");
      if (!searchInput) return;

      const searchValue = searchInput.value.trim();
      applyFilters({ search: searchValue });
    });
  }

  // Add keypress handler for search input (for enter key)
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const searchValue = this.value.trim();
        applyFilters({ search: searchValue });
      }
    });
  }

  // Set up event listeners for filter form
  const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    filterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const filters = {};

      // Get date range if present
      const startDate = document.getElementById("startDate");
      const endDate = document.getElementById("endDate");
      if (startDate && startDate.value) filters.startDate = startDate.value;
      if (endDate && endDate.value) filters.endDate = endDate.value;

      // Get min and max amount if present
      const minAmount = document.getElementById("minAmount");
      const maxAmount = document.getElementById("maxAmount");
      if (minAmount && minAmount.value) filters.minAmount = minAmount.value;
      if (maxAmount && maxAmount.value) filters.maxAmount = maxAmount.value;

      // Get status if present (for all investments page)
      const statusSelect = document.getElementById("status");
      if (statusSelect && statusSelect.value) {
        filters.status = statusSelect.value;
      } else if (status) {
        // Apply the specific status for active/completed pages
        filters.status = status;
      }

      // Get sort order if present
      const sortOrder = document.getElementById("sortOrder");
      if (sortOrder && sortOrder.value) filters.sortOrder = sortOrder.value;

      applyFilters(filters);
    });
  }

  // Set up event listener for reset button
  const resetButton = document.getElementById("resetFilters");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      // Clear all filter inputs
      if (filterForm) filterForm.reset();
      if (searchForm) searchForm.reset();

      // Reset to base URL with only status if specified
      if (status) {
        applyFilters({ status });
      } else {
        window.location.href = window.location.pathname;
      }
    });
  }

  // Set up pagination click handlers
  document.querySelectorAll(".pagination-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const page = this.getAttribute("data-page");
      if (!page) return;

      // Get current URL params
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", page);

      window.location.href = `${
        window.location.pathname
      }?${urlParams.toString()}`;
    });
  });

  // View investment details
  setupInvestmentDetailsViewHandlers();

  // Confirm investment handlers
  document.querySelectorAll(".confirm-investment-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const investmentId = this.getAttribute("data-investment-id");
      if (!investmentId) return;

      if (!confirm("Are you sure you want to confirm this investment?")) {
        return;
      }

      try {
        // Disable button and show loading state
        this.disabled = true;
        this.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        const response = await confirmInvestment(investmentId);

        if (response.success) {
          showToast(
            response.message || "Investment confirmed successfully",
            "success"
          );

          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(response.message || "Failed to confirm investment");
        }
      } catch (error) {
        console.error("Error confirming investment:", error);
        showToast(error.message || "Failed to confirm investment", "error");

        // Restore button state
        this.disabled = false;
        this.textContent = "Confirm";
      }
    });
  });

  // Cancel investment handlers
  document.querySelectorAll(".cancel-investment-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const investmentId = this.getAttribute("data-investment-id");
      if (!investmentId) return;

      if (
        !confirm(
          "Are you sure you want to cancel this investment? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        // Disable button and show loading state
        this.disabled = true;
        this.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        const response = await cancelInvestment(investmentId);

        if (response.success) {
          showToast(
            response.message || "Investment cancelled successfully",
            "success"
          );

          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(response.message || "Failed to cancel investment");
        }
      } catch (error) {
        console.error("Error cancelling investment:", error);
        showToast(error.message || "Failed to cancel investment", "error");

        // Restore button state
        this.disabled = false;
        this.textContent = "Cancel";
      }
    });
  });
}

/**
 * Apply filters to the current page
 * @param {Object} filters - The filters to apply
 */
function applyFilters(filters = {}) {
  const queryParams = [];

  for (const key in filters) {
    if (filters[key]) {
      queryParams.push(`${key}=${encodeURIComponent(filters[key])}`);
    }
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  window.location.href = `${window.location.pathname}${queryString}`;
}

/**
 * Render investment details in the modal
 * @param {Object} investment - The investment object
 * @param {HTMLElement} modal - The modal element
 */
function renderInvestmentDetails(investment, modal) {
  if (!modal) return;

  const modalBody = modal.querySelector(".modal-body");
  if (!modalBody) return;

  // Format dates
  const createdAt = investment.createdAt
    ? new Date(investment.createdAt).toLocaleString()
    : "N/A";
  const startDate = investment.startDate
    ? new Date(investment.startDate).toLocaleString()
    : "Not started";
  const endDate = investment.endDate
    ? new Date(investment.endDate).toLocaleString()
    : "Not set";

  // Calculate expected earnings
  const expectedEarnings =
    investment.expectedEarning ||
    (investment.amount * investment.earningRate * investment.duration).toFixed(
      2
    );

  // Determine status badge class
  let statusBadgeClass = "bg-light";
  if (investment.status === "pending") statusBadgeClass = "bg-warning";
  if (investment.status === "active") statusBadgeClass = "bg-success";
  if (investment.status === "completed") statusBadgeClass = "bg-info";
  if (investment.status === "cancelled") statusBadgeClass = "bg-danger";

  // Build modal content
  modalBody.innerHTML = `
    <div class="nk-block">
      <div class="nk-block-head">
        <h5 class="title">Investment Information</h5>
        <p class="text-soft">Investment details for ID: ${investment._id}</p>
      </div>
      <div class="card card-bordered">
        <div class="card-inner">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Investor Name</label>
                <div class="form-control-wrap">
                  <div class="form-text-hint">
                    <span class="overline-title">User</span>
                  </div>
                  <input type="text" class="form-control" value="${
                    investment.userId?.fullName || "Unknown"
                  }" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Investor Email</label>
                <div class="form-control-wrap">
                  <div class="form-text-hint">
                    <span class="overline-title">Email</span>
                  </div>
                  <input type="text" class="form-control" value="${
                    investment.userId?.email || "Unknown"
                  }" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Investment Plan</label>
                <div class="form-control-wrap">
                  <div class="form-text-hint">
                    <span class="overline-title">Plan</span>
                  </div>
                  <input type="text" class="form-control" value="${
                    investment.planId?.name || "Unknown Plan"
                  }" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Investment Amount</label>
                <div class="form-control-wrap">
                  <div class="form-text-hint">
                    <span class="overline-title">USD</span>
                  </div>
                  <input type="text" class="form-control" value="$${investment.amount.toFixed(
                    2
                  )}" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">ROI Rate</label>
                <div class="form-control-wrap">
                  <div class="form-text-hint">
                    <span class="overline-title">%</span>
                  </div>
                  <input type="text" class="form-control" value="${(
                    investment.earningRate * 100
                  ).toFixed(1)}%" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Duration</label>
                <div class="form-control-wrap">
                  <input type="text" class="form-control" value="${
                    investment.duration
                  } ${investment.durationUnit}${
    investment.duration > 1 ? "s" : ""
  }" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Expected Earnings</label>
                <div class="form-control-wrap">
                  <div class="form-text-hint">
                    <span class="overline-title">USD</span>
                  </div>
                  <input type="text" class="form-control" value="$${expectedEarnings}" disabled>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label text-muted">Status</label>
                <div class="form-control-wrap">
                  <span class="badge ${statusBadgeClass}">${
    investment.status
  }</span>
                </div>
              </div>
            </div>
            <div class="col-md-12">
              <div class="form-group">
                <label class="form-label text-muted">Timeline</label>
                <ul class="timeline-list">
                  <li class="timeline-item">
                    <div class="timeline-status bg-primary"></div>
                    <div class="timeline-date">Created: <span>${createdAt}</span></div>
                  </li>
                  <li class="timeline-item">
                    <div class="timeline-status ${
                      investment.startDate ? "bg-success" : "bg-light"
                    }"></div>
                    <div class="timeline-date">Started: <span>${startDate}</span></div>
                  </li>
                  <li class="timeline-item">
                    <div class="timeline-status ${
                      investment.endDate ? "bg-info" : "bg-light"
                    }"></div>
                    <div class="timeline-date">Ends: <span>${endDate}</span></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add action buttons to modal footer if needed based on status
  const modalFooter = modal.querySelector(".modal-footer");
  if (modalFooter) {
    // Start with the close button that's always present
    let buttonsHTML =
      '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';

    // Add status-specific action buttons
    if (investment.status === "pending") {
      buttonsHTML += `
        <button type="button" class="btn btn-success confirm-modal-investment-btn" data-investment-id="${investment._id}">Confirm</button>
        <button type="button" class="btn btn-danger cancel-modal-investment-btn" data-investment-id="${investment._id}">Cancel</button>
      `;
    } else if (investment.status === "active") {
      buttonsHTML += `
        <button type="button" class="btn btn-danger cancel-modal-investment-btn" data-investment-id="${investment._id}">Cancel</button>
      `;
    }

    modalFooter.innerHTML = buttonsHTML;

    // Add event listeners to the buttons
    const confirmBtn = modalFooter.querySelector(
      ".confirm-modal-investment-btn"
    );
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async function () {
        const investmentId = this.getAttribute("data-investment-id");
        if (!investmentId) return;

        if (!confirm("Are you sure you want to confirm this investment?")) {
          return;
        }

        try {
          // Disable button and show loading state
          this.disabled = true;
          this.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

          const response = await confirmInvestment(investmentId);

          if (response.success) {
            showToast(
              response.message || "Investment confirmed successfully",
              "success"
            );

            // Close modal and reload page
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            throw new Error(response.message || "Failed to confirm investment");
          }
        } catch (error) {
          console.error("Error confirming investment:", error);
          showToast(error.message, "error");

          // Restore button state
          this.disabled = false;
          this.textContent = "Confirm";
        }
      });
    }

    const cancelBtn = modalFooter.querySelector(".cancel-modal-investment-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", async function () {
        const investmentId = this.getAttribute("data-investment-id");
        if (!investmentId) return;

        if (
          !confirm(
            "Are you sure you want to cancel this investment? This action cannot be undone."
          )
        ) {
          return;
        }

        try {
          // Disable button and show loading state
          this.disabled = true;
          this.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

          const response = await cancelInvestment(investmentId);

          if (response.success) {
            showToast(
              response.message || "Investment cancelled successfully",
              "success"
            );

            // Close modal and reload page
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            throw new Error(response.message || "Failed to cancel investment");
          }
        } catch (error) {
          console.error("Error cancelling investment:", error);
          showToast(error.message, "error");

          // Restore button state
          this.disabled = false;
          this.textContent = "Cancel";
        }
      });
    }
  }
}

/**
 * View investment details - improve handler to work with dynamically added buttons
 */
function setupInvestmentDetailsViewHandlers() {
  document.querySelectorAll(".view-investment-btn").forEach((button) => {
    // Skip if already has click handler
    if (button.hasAttribute("data-handler-attached")) return;

    button.setAttribute("data-handler-attached", "true");
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      const investmentId = this.getAttribute("data-investment-id");
      if (!investmentId) return;

      try {
        // Show loading state
        const modal = document.getElementById("investmentDetailsModal");
        if (modal) {
          const modalBody = modal.querySelector(".modal-body");
          if (modalBody) {
            modalBody.innerHTML = `
              <div class="d-flex justify-content-center my-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            `;
          }

          // Open the modal
          const bsModal = new bootstrap.Modal(modal);

          // Add event listener to properly clean up the modal when it's hidden
          modal.addEventListener(
            "hidden.bs.modal",
            function () {
              // Remove the modal backdrop if it exists
              const backdrop = document.querySelector(".modal-backdrop");
              if (backdrop) {
                backdrop.remove();
              }

              // Remove the 'modal-open' class from the body
              document.body.classList.remove("modal-open");
              document.body.style.removeProperty("padding-right");
              document.body.style.removeProperty("overflow");
            },
            { once: true }
          );

          bsModal.show();
        }

        // Fetch investment details
        const response = await getInvestmentDetails(investmentId);

        if (response.success && response.investment) {
          renderInvestmentDetails(response.investment, modal);
        } else {
          throw new Error(
            response.message || "Failed to fetch investment details"
          );
        }
      } catch (error) {
        console.error("Error viewing investment details:", error);
        showToast(
          error.message || "Failed to load investment details",
          "error"
        );
      }
    });
  });
}

// Document ready handler
document.addEventListener("DOMContentLoaded", function () {
  // Initialize tables if they exist
  if (document.getElementById("activeInvestmentsTable")) {
    initInvestmentsTable("activeInvestmentsTable", "active");
  }

  if (document.getElementById("completedInvestmentsTable")) {
    initInvestmentsTable("completedInvestmentsTable", "completed");
  }

  if (document.getElementById("allInvestmentsTable")) {
    initInvestmentsTable("allInvestmentsTable");
  }

  // Setup investment details view event handlers if we're on a page with investment details modal
  // This catches any view buttons that might not be in tables
  if (document.getElementById("investmentDetailsModal")) {
    setupInvestmentDetailsViewHandlers();
  }
});
