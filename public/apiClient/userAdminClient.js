/**
 *  User Admin API Client
 * Handles all admin user-related API operations
 */

/**
 * Get all users with optional filters
 * @param {Object} queryParams - Query parameters to filte/**
 * Get investment plans
 * @returns {Promise<Object>} Response containing plans data
 */
async function getInvestmentPlans() {
  try {
    return await apiGet("/admin/plans/api");
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Update a user's personal information
 * @param {string} userId - The user ID to update
 * @param {Object} userData - Personal information data to update
 * @returns {Promise<Object>} Response containing updated user data
 */
async function updateUserPersonalInfo(userId, userData) {
  try {
    return await apiPatch(`/admin/users/api/${userId}/personal-info`, userData);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Update a user's wallet information
 * @param {string} userId - The user ID to update
 * @param {Object} walletData - Wallet data to update
 * @returns {Promise<Object>} Response containing updated wallet data
 */
async function updateUserWallet(userId, walletData) {
  try {
    return await apiPatch(`/admin/users/api/${userId}/wallet`, walletData);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Add or update a withdrawal address for a user
 * @param {string} userId - The user ID to update
 * @param {Object} addressData - Address data with currency, address, network, and label
 * @returns {Promise<Object>} Response containing updated wallet data
 */
async function updateWithdrawalAddress(userId, addressData) {
  try {
    return await apiPost(
      `/admin/users/api/${userId}/withdrawal-address`,
      addressData
    );
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Delete a withdrawal address for a user
 * @param {string} userId - The user ID
 * @param {string} addressId - The ID of the address to delete
 * @returns {Promise<Object>} Response containing updated wallet data
 */
async function deleteWithdrawalAddress(userId, addressId) {
  try {
    return await apiDelete(`/admin/users/api/${userId}/withdrawal-address`, {
      addressId,
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}
/*
returns {Promise<Object>} Response containing users data
 */
async function getUsers(queryParams = {}) {
  try {
    // Convert queryParams object to URL search params
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      params.append(key, value);
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const url = `/admin/users/api${queryString}`;

    try {
      const response = await apiGet(url);
      return response;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("getUsers error:", error);
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Get active users
 * @returns {Promise<Object>} Response containing active users data
 */
async function getActiveUsers(params = {}) {
  return getUsers({ status: "active", ...params });
}

/**
 * Get inactive users (users with unverified emails)
 * @returns {Promise<Object>} Response containing inactive users data
 */
async function getInactiveUsers(params = {}) {
  return getUsers({ status: "inactive", ...params });
}

/**
 * Get suspended/blocked users
 * @returns {Promise<Object>} Response containing suspended users data
 */
async function getSuspendedUsers(params = {}) {
  return getUsers({ status: "suspended", ...params });
}

/**
 * Get admin users
 * @returns {Promise<Object>} Response containing admin users data
 */
async function getAdminUsers(params = {}) {
  return getUsers({ role: "admin", ...params });
}

/**
 * Get a specific user's details
 * @param {string} userId - The user ID to fetch
 * @returns {Promise<Object>} Response containing user details
 */
async function getUserDetails(userId) {
  try {
    return await apiGet(`/admin/users/api/${userId}`);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Update a user's withdrawal limit
 * @param {string} userId - The user ID to update
 * @param {number} limit - The new withdrawal limit
 * @returns {Promise<Object>} Response containing updated user data
 */
async function updateWithdrawalLimit(userId, limit) {
  try {
    return await apiPatch(`/admin/users/api/${userId}/withdrawal-limit`, {
      limit: parseFloat(limit),
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Update a user's KYC status
 * @param {string} userId - The user ID to update
 * @param {string} status - The new KYC status (approved, rejected, pending)
 * @returns {Promise<Object>} Response containing updated user data
 */
async function updateKycStatus(userId, status) {
  try {
    return await apiPatch(`/admin/users/api/${userId}/kyc-status`, {
      status,
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Toggle user block status
 * @param {string} userId - The user ID to update
 * @param {boolean} blocked - Whether to block or unblock the user
 * @returns {Promise<Object>} Response containing updated user data
 */
async function toggleBlockStatus(userId, blocked) {
  try {
    return await apiPatch(`/admin/users/api/${userId}/block-status`, {
      blocked,
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Bulk update users (block/unblock, make admin, etc.)
 * @param {Array} userIds - Array of user IDs to update
 * @param {string} action - Action to perform (block, unblock, makeAdmin, removeAdmin)
 * @returns {Promise<Object>} Response containing update results
 */
async function bulkUpdateUsers(userIds, action) {
  try {
    return await apiPost(`/admin/users/api/block-status`, {
      userIds,
      action,
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Send bulk email to selected users
 * @param {Array} userIds - Array of user IDs to email
 * @param {Object} emailData - Email subject, body, etc.
 * @returns {Promise<Object>} Response containing email send results
 */
async function sendBulkEmail(userIds, emailData) {
  try {
    return await apiPost(`/admin/users/api/send-email`, {
      userIds,
      ...emailData,
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Send investment plan invitations to selected users
 * @param {Array} userIds - Array of user IDs to invite
 * @param {string} planId - ID of the plan to invite users to
 * @returns {Promise<Object>} Response containing invitation results
 */
async function sendPlanInvitations(userIds, planId) {
  try {
    return await apiPost(`/admin/users/api/send-plan-invitation`, {
      userIds,
      planId,
    });
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Get all investment plans
 * @returns {Promise<Object>} Response containing plans data
 */
async function getInvestmentPlans() {
  try {
    return await apiGet("/admin/plans/api");
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

// Initialize event listeners for the admin user pages
function initAdminUserPages() {
  document.addEventListener("DOMContentLoaded", () => {
    // Handle withdrawal limit form submission
    const withdrawalLimitForm = document.getElementById(
      "withdrawal-limit-form"
    );
    if (withdrawalLimitForm) {
      withdrawalLimitForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = withdrawalLimitForm.getAttribute("data-user-id");
        const limit = document.getElementById("withdrawal-limit").value;

        try {
          const response = await updateWithdrawalLimit(userId, limit);
          if (response.success) {
            showToast(response.message, "success");
            setTimeout(() => location.reload(), 1000);
          } else {
            showToast(response.message, "error");
          }
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    }

    // Handle KYC status updates
    const kycStatusForm = document.getElementById("kyc-status-form");
    if (kycStatusForm) {
      kycStatusForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = kycStatusForm.getAttribute("data-user-id");
        const status = document.getElementById("kyc-status").value;

        try {
          const response = await updateKycStatus(userId, status);
          if (response.success) {
            showToast(response.message, "success");
            setTimeout(() => location.reload(), 1000);
          } else {
            showToast(response.message, "error");
          }
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    }
  });
}

// Load tables with user data
async function loadUserTable(tableId, fetchFunction, page = 1, limit = 10) {
  const table = document.getElementById(tableId);
  if (!table) return;

  try {
    const loadingRow = document.createElement("tr");
    loadingRow.innerHTML = `<td colspan="8" class="text-center">Loading users...</td>`;
    table.querySelector("tbody").innerHTML = "";
    table.querySelector("tbody").appendChild(loadingRow);

    const queryParams = { page, limit };
    const response = await fetchFunction(queryParams);

    // Clear the loading message
    table.querySelector("tbody").innerHTML = "";

    if (response.success && response.users && response.users.length > 0) {
      response.users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="nk-tb-col nk-tb-col-check" data-label="">
            <div class="custom-control custom-control-sm custom-checkbox notext">
              <input type="checkbox" class="custom-control-input user-select" value="${
                user._id
              }" id="uid${user._id}">
              <label class="custom-control-label" for="uid${user._id}"></label>
            </div>
          </td>
          <td data-label="Full Name" >${user.fullName}</td>
          <td data-label="Email" class="tb-col-md">${user.email}</td>
          <td data-label="Country" class="tb-col-md">${user.country || "N/A"}</td>
          <td data-label="Registered Date" class="tb-col-md">${new Date(
            user.createdAt
          ).toLocaleDateString()}</td>
          <td data-label="Status">
            <span class="badge ${
              user.isEmailVerified ? "bg-success" : "bg-warning"
            }">
              ${user.isEmailVerified ? "Verified" : "Unverified"}
            </span>
          </td>
          <td data-label="Action">
            <div class="dropdown">
              <a class="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown">
                <em class="icon ni ni-more-h"></em>
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <ul class="link-list-opt no-bdr">
                  <li><a href="/admin/users/${
                    user._id
                  }"><em class="icon ni ni-eye"></em><span>View User</span></a></li>
                  <li><a href="#" class="toggle-block-btn" data-user-id="${
                    user._id
                  }" data-is-blocked="${user.isBlocked}">
                    <em class="icon ni ${
                      user.isBlocked ? "ni-unlock" : "ni-na"
                    }"></em>
                    <span>${user.isBlocked ? "Unblock" : "Block"} User</span>
                  </a></li>
                  ${
                    user.role !== "admin"
                      ? `<li><a href="#" class="make-admin-btn" data-user-id="${user._id}">
                      <em class="icon ni ni-shield-star"></em><span>Make Admin</span>
                    </a></li>`
                      : `<li><a href="#" class="remove-admin-btn" data-user-id="${user._id}">
                      <em class="icon ni ni-shield-off"></em><span>Remove Admin</span>
                    </a></li>`
                  }
                  <li><a href="#" class="send-email-btn" data-user-id="${
                    user._id
                  }" data-user-email="${user.email}">
                    <em class="icon ni ni-mail"></em><span>Send Email</span>
                  </a></li>
                </ul>
              </div>
            </div>
          </td>
        `;
        table.querySelector("tbody").appendChild(row);
      });

      // Initialize block/unblock buttons
      document.querySelectorAll(".toggle-block-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const userId = btn.getAttribute("data-user-id");
          const isBlocked = btn.getAttribute("data-is-blocked") === "true";

          if (
            confirm(
              `Are you sure you want to ${
                isBlocked ? "unblock" : "block"
              } this user?`
            )
          ) {
            try {
              const response = await toggleBlockStatus(userId, !isBlocked);
              if (response.success) {
                showToast(response.message, "success");
                setTimeout(() => location.reload(), 1000);
              } else {
                showToast(response.message || "Operation failed", "error");
              }
            } catch (error) {
              showToast(error.message || "Operation failed", "error");
            }
          }
        });
      });

      // Initialize make/remove admin buttons
      document
        .querySelectorAll(".make-admin-btn, .remove-admin-btn")
        .forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const userId = btn.getAttribute("data-user-id");
            const isAdmin = btn.classList.contains("remove-admin-btn");
            const action = isAdmin ? "removeAdmin" : "makeAdmin";

            if (
              confirm(
                `Are you sure you want to ${
                  isAdmin
                    ? "remove admin privileges from"
                    : "make this user an admin"
                }?`
              )
            ) {
              try {
                const response = await bulkUpdateUsers([userId], action);
                if (response.success) {
                  showToast(response.message, "success");
                  setTimeout(() => location.reload(), 1000);
                } else {
                  showToast(response.message || "Operation failed", "error");
                }
              } catch (error) {
                showToast(error.message || "Operation failed", "error");
              }
            }
          });
        });

      // Create pagination if total count exists
      if (response.count) {
        const totalPages = Math.ceil(response.count / limit);
        renderPagination(
          tableId + "-pagination",
          page,
          totalPages,
          (newPage) => {
            loadUserTable(tableId, fetchFunction, newPage, limit);
          }
        );
      }

      // Return the response for additional processing
      return response;
    } else {
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `<td colspan="8" class="text-center">No users found</td>`;
      table.querySelector("tbody").appendChild(noDataRow);

      // Hide pagination if no results
      const paginationEl = document.getElementById(tableId + "-pagination");
      if (paginationEl) paginationEl.innerHTML = "";

      return response;
    }
  } catch (error) {
    console.error("Error loading user table:", error);
    const errorRow = document.createElement("tr");
    errorRow.innerHTML = `<td colspan="8" class="text-center text-danger">Error loading users: ${error.message}</td>`;
    table.querySelector("tbody").innerHTML = "";
    table.querySelector("tbody").appendChild(errorRow);
  }
}

/**
 * Render pagination controls
 * @param {string} containerId - ID of container to hold pagination
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total pages
 * @param {Function} callback - Function to call when page changes
 */
function renderPagination(containerId, currentPage, totalPages, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (totalPages <= 1) return;

  const ul = document.createElement("ul");
  ul.className = "pagination justify-content-center";

  // Previous button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  const prevLink = document.createElement("a");
  prevLink.className = "page-link";
  prevLink.href = "#";
  prevLink.innerHTML = '<em class="icon ni ni-chevron-left"></em>';
  prevLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      callback(currentPage - 1);
    }
  });
  prevLi.appendChild(prevLink);
  ul.appendChild(prevLi);

  // Page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    const link = document.createElement("a");
    link.className = "page-link";
    link.href = "#";
    link.textContent = i;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      callback(i);
    });
    li.appendChild(link);
    ul.appendChild(li);
  }

  // Next button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  const nextLink = document.createElement("a");
  nextLink.className = "page-link";
  nextLink.href = "#";
  nextLink.innerHTML = '<em class="icon ni ni-chevron-right"></em>';
  nextLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      callback(currentPage + 1);
    }
  });
  nextLi.appendChild(nextLink);
  ul.appendChild(nextLi);

  container.appendChild(ul);
}

/**
 * Initialize multi-select functionality
 */
function initMultiSelectFunctions() {
  document.addEventListener("DOMContentLoaded", () => {
    // Toggle all checkboxes
    const selectAllCheckbox = document.getElementById("select-all");
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        document.querySelectorAll(".user-select").forEach((checkbox) => {
          checkbox.checked = selectAllCheckbox.checked;
        });
        updateBulkActionButtons();
      });
    }

    // Individual checkbox changes
    document.addEventListener("change", function (e) {
      if (e.target && e.target.classList.contains("user-select")) {
        updateBulkActionButtons();
      }
    });

    // Update bulk action buttons state
    function updateBulkActionButtons() {
      const checkedCount = document.querySelectorAll(
        ".user-select:checked"
      ).length;
      const bulkActionBtns = document.querySelectorAll(".bulk-action-btn");

      bulkActionBtns.forEach((btn) => {
        if (checkedCount > 0) {
          btn.classList.remove("disabled");
          btn.setAttribute("aria-disabled", "false");
        } else {
          btn.classList.add("disabled");
          btn.setAttribute("aria-disabled", "true");
        }

        // Update count in button text
        const countSpan = btn.querySelector(".selected-count");
        if (countSpan) {
          countSpan.textContent = checkedCount;
        }
      });
    }

    // Handle bulk email modal
    const bulkEmailModal = document.getElementById("bulkEmailModal");
    if (bulkEmailModal) {
      const bulkEmailForm = bulkEmailModal.querySelector("form");
      bulkEmailForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userIds = Array.from(
          document.querySelectorAll(".user-select:checked")
        ).map((cb) => cb.value);

        const emailSubject = bulkEmailForm.querySelector("#emailSubject").value;
        const emailBody = bulkEmailForm.querySelector("#emailBody").value;
        console.log("userIds", userIds);
        console.log("emailSubject", emailSubject);
        console.log("emailBody", emailBody);

        try {
          const response = await sendBulkEmail(userIds, {
            subject: emailSubject,
            body: emailBody,
          });

          if (response.success) {
            showToast("Emails sent successfully", "success");
            bootstrap.Modal.getInstance(bulkEmailModal).hide();
          } else {
            showToast(response.message || "Failed to send emails", "error");
          }
        } catch (error) {
          showToast(error.message || "Failed to send emails", "error");
        }
      });
    }

    // Handle plan invitation modal
    const planInviteModal = document.getElementById("planInviteModal");
    if (planInviteModal) {
      // Load available plans when modal opens
      planInviteModal.addEventListener("show.bs.modal", async () => {
        const planSelect = planInviteModal.querySelector("#planSelect");
        if (!planSelect || planSelect.options.length > 1) return;

        try {
          const response = await getInvestmentPlans();
          if (response.success && response.plans) {
            planSelect.innerHTML = '<option value="">Select a plan</option>';
            response.plans.forEach((plan) => {
              const option = document.createElement("option");
              option.value = plan._id;
              option.textContent = `${plan.name} - (${plan.type})`;
              planSelect.appendChild(option);
            });
          }
        } catch (error) {
          console.error("Error loading plans:", error);
        }
      });

      const inviteForm = planInviteModal.querySelector("form");
      inviteForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userIds = Array.from(
          document.querySelectorAll(".user-select:checked")
        ).map((cb) => cb.value);

        const planId = inviteForm.querySelector("#planSelect").value;

        if (!planId) {
          showToast("Please select a plan", "error");
          return;
        }

        try {
          const response = await sendPlanInvitations(userIds, planId);

          if (response.success) {
            showToast("Plan invitations sent successfully", "success");
            bootstrap.Modal.getInstance(planInviteModal).hide();
          } else {
            showToast(
              response.message || "Failed to send invitations",
              "error"
            );
          }
        } catch (error) {
          showToast(error.message || "Failed to send invitations", "error");
        }
      });
    }

    // Bulk action buttons
    document.querySelectorAll(".bulk-action").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const userIds = Array.from(
          document.querySelectorAll(".user-select:checked")
        ).map((cb) => cb.value);

        if (userIds.length === 0) {
          showToast("No users selected", "error");
          return;
        }

        const action = btn.getAttribute("data-action");

        if (action === "email") {
          // Open email modal - handled by Bootstrap
          return;
        }

        if (action === "invite") {
          // Open plan invitation modal - handled by Bootstrap
          return;
        }

        // For block/unblock/makeAdmin/removeAdmin
        if (["block", "unblock"].includes(action)) {
          const actionMap = {
            block: "block",
            unblock: "unblock",
          };

          if (
            confirm(
              `Are you sure you want to ${actionMap[action]} ${userIds.length} selected users?`
            )
          ) {
            try {
              const response = await bulkUpdateUsers(userIds, action);

              if (response.success) {
                showToast(
                  response.message ||
                    `Successfully ${
                      action === "makeAdmin" ? "made" : action + "ed"
                    } ${userIds.length} users`,
                  "success"
                );
                setTimeout(() => location.reload(), 1000);
              } else {
                showToast(response.message || "Operation failed", "error");
              }
            } catch (error) {
              showToast(error.message || "Operation failed", "error");
            }
          }
        }
      });
    });
  });
}

// Initialize admin user pages and multi-select functionality
initAdminUserPages();
initMultiSelectFunctions();
