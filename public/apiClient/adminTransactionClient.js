// /**
//  * ExNestrade Admin Transaction API Client
//  * Handles all admin-specific transaction-related API operations
//  */

// /**
//  * Confirm a pending investment
//  * @param {string} investmentId - The investment ID to confirm
//  */
// async function confirmInvestment(investmentId) {
//   if (!confirm("Are you sure you want to approve this investment?")) {
//     return;
//   }

//   // Show loading state
//   document.body.style.cursor = "wait";

//   try {
//     const response = await apiPost(
//       `/admin/api/investments/confirm/${investmentId}`
//     );

//     if (response.success) {
//       showToast("Investment approved successfully", "success");

//       // Hide any open modals
//       const detailsModal = bootstrap.Modal.getInstance(
//         document.getElementById("investmentDetails")
//       );
//       if (detailsModal) {
//         detailsModal.hide();
//       }

//       // Reload the page to refresh the investments list
//       setTimeout(() => {
//         window.location.reload();
//       }, 1500);
//     } else {
//       showToast("Error: " + response.message, "error");
//     }
//   } catch (error) {
//     showToast("An error occurred: " + error.message, "error");
//   } finally {
//     document.body.style.cursor = "default";
//   }
// }

// /**
//  * Cancel a pending investment
//  * @param {string} investmentId - The investment ID to cancel
//  */
// async function cancelInvestment(investmentId) {
//   // Create a modal for rejection reason
//   const rejectModal = document.createElement("div");
//   rejectModal.className = "modal fade";
//   rejectModal.id = "rejectReasonModal";
//   rejectModal.setAttribute("tabindex", "-1");
//   rejectModal.setAttribute("aria-hidden", "true");

//   rejectModal.innerHTML = `
//     <div class="modal-dialog">
//       <div class="modal-content">
//         <div class="modal-header">
//           <h5 class="modal-title">Rejection Reason</h5>
//           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//         </div>
//         <div class="modal-body">
//           <div class="form-group">
//             <label class="form-label">Please provide a reason for rejecting this investment (optional)</label>
//             <textarea class="form-control" id="rejectionReason" rows="3"></textarea>
//           </div>
//         </div>
//         <div class="modal-footer">
//           <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
//           <button type="button" class="btn btn-danger" id="confirmRejectBtn">Reject Investment</button>
//         </div>
//       </div>
//     </div>
//   `;

//   document.body.appendChild(rejectModal);

//   // Show the modal
//   const bsModal = new bootstrap.Modal(
//     document.getElementById("rejectReasonModal")
//   );
//   bsModal.show();

//   // Add event listener to the confirm button
//   document
//     .getElementById("confirmRejectBtn")
//     .addEventListener("click", async function () {
//       const reason = document.getElementById("rejectionReason").value.trim();

//       // Close the modal
//       bsModal.hide();

//       // Show loading state
//       document.body.style.cursor = "wait";

//       try {
//         const response = await apiPost(
//           `/admin/api/investments/cancel/${investmentId}`,
//           { reason }
//         );

//         if (response.success) {
//           showToast("Investment rejected successfully", "success");

//           // Hide any open modals
//           const detailsModal = bootstrap.Modal.getInstance(
//             document.getElementById("investmentDetails")
//           );
//           if (detailsModal) {
//             detailsModal.hide();
//           }

//           // Reload the page to refresh the investments list
//           setTimeout(() => {
//             window.location.reload();
//           }, 1500);
//         } else {
//           showToast("Error: " + response.message, "error");
//         }
//       } catch (error) {
//         showToast("An error occurred: " + error.message, "error");
//       } finally {
//         document.body.style.cursor = "default";

//         // Remove the modal from DOM after it's been hidden
//         document
//           .getElementById("rejectReasonModal")
//           .addEventListener("hidden.bs.modal", function () {
//             document.body.removeChild(rejectModal);
//           });
//       }
//     });
// }

// /**
//  * View investment details
//  * @param {string} investmentId - The investment ID to view
//  */
// async function viewInvestmentDetails(investmentId) {
//   try {
//     // Get investment ID from the DOM if not provided (for events)
//     if (!investmentId) {
//       investmentId = this.getAttribute("data-id");
//     }

//     // Fetch investment details from API
//     const data = await apiGet(`/admin/transaction/api/investments/${investmentId}`);

//     if (data.success) {
//       const investment = data.investment;
//       const user = investment.userId;
//       const plan = investment.planId;

//       // Set investment details in the modal
//       document.querySelector(".investment-id").textContent = investment._id;
//       document.querySelector(
//         ".investment-amount"
//       ).textContent = `$${investment.amount.toFixed(2)}`;
//       document.querySelector(
//         ".investment-amount-detail"
//       ).textContent = `$${investment.amount.toFixed(2)}`;
//       document.querySelector(".investment-date").textContent = new Date(
//         investment.createdAt
//       ).toLocaleString();

//       // Set user details
//       document.querySelector(".investor-name").textContent = user.fullName;
//       document.querySelector(".investor-email").textContent = user.email;

//       // Set plan details
//       document.querySelector(".plan-name").textContent = plan.name;

//       // Set ROI and duration
//       document.querySelector(".investment-roi").textContent = `${(
//         investment.earningRate * 100
//       ).toFixed(1)}%`;
//       document.querySelector(".investment-duration").textContent = `${
//         investment.duration
//       } ${investment.durationUnit}${investment.duration > 1 ? "s" : ""}`;

//       // Update action buttons with proper investment ID
//       document
//         .querySelector(".btn-confirm-modal")
//         .setAttribute("data-id", investment._id);
//       document.querySelector(".btn-confirm-modal").onclick = function () {
//         confirmInvestment(this.getAttribute("data-id"));
//       };
//       document
//         .querySelector(".btn-cancel-modal")
//         .setAttribute("data-id", investment._id);
//       document.querySelector(".btn-cancel-modal").onclick = function () {
//         cancelInvestment(this.getAttribute("data-id"));
//       };
//     } else {
//       showToast("Error: " + data.message, "error");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     showToast("An error occurred while fetching investment details", "error");
//   }
// }

// /**
//  * Edit investment details
//  * @param {string} investmentId - The investment ID to edit
//  */
// async function editInvestment(investmentId) {
//   // Get investment ID from the DOM if not provided (for events)
//   if (!investmentId) {
//     investmentId = this.getAttribute("data-id");
//   }

//   try {
//     // First get the current details
//     const data = await apiGet(`/admin/transaction/api/investments/${investmentId}`);
    
//     if (data.success) {
//       const investment = data.investment;
//       console.log("investment", data.investment._id);


//       // Populate the edit form
//       document.getElementById("editInvestmentId").value = investment._id;
//       document.getElementById("editInvestmentAmount").value = investment.amount;
//       document.getElementById("editInvestmentROI").value = (
//         investment.earningRate * 100
//       ).toFixed(1);
//       document.getElementById("editInvestmentDuration").value =
//         investment.duration;
//       document.getElementById("editInvestmentUnit").value =
//         investment.durationUnit;

//       // Update user and plan info in the form
//       document.getElementById("editInvestorName").textContent =
//         investment.userId.fullName;
//       document.getElementById("editPlanName").textContent =
//         investment.planId.name;
//     } else {
//       showToast("Error: " + data.message, "error");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     showToast(
//       "An error occurred while fetching investment details for editing",
//       "error"
//     );
//   }
// }

// /**
//  * Save edited investment details
//  * @param {Event} event - Form submission event
//  */
// async function saveInvestmentChanges(event) {
//   event.preventDefault();

//   const submitBtn = document.getElementById("saveInvestmentChanges");
//   const submitSpinner = document.getElementById("saveChangesSpinner");
//   const errorElement = document.getElementById("editInvestmentError");

//   // Show loading state
//   submitBtn.disabled = true;
//   submitSpinner.classList.remove("d-none");
//   errorElement.style.display = "none";

//   try {
//     const investmentId = document.getElementById("editInvestmentId").value;
//     const amount = parseFloat(
//       document.getElementById("editInvestmentAmount").value
//     );
//     const earningRate =
//       parseFloat(document.getElementById("editInvestmentROI").value) / 100;
//     const duration = parseInt(
//       document.getElementById("editInvestmentDuration").value
//     );
//     const durationUnit = document.getElementById("editInvestmentUnit").value;

//     // Simple validation
//     if (!amount || amount <= 0) {
//       throw new Error("Please enter a valid amount");
//     }

//     if (!earningRate || earningRate <= 0) {
//       throw new Error("Please enter a valid ROI percentage");
//     }

//     if (!duration || duration <= 0) {
//       throw new Error("Please enter a valid duration");
//     }

//     const response = await apiPut(`/admin/api/investments/${investmentId}`, {
//       amount,
//       earningRate,
//       duration,
//       durationUnit,
//     });

//     if (response.success) {
//       // Hide the modal
//       const modal = bootstrap.Modal.getInstance(
//         document.getElementById("editInvestmentModal")
//       );
//       modal.hide();

//       // Show success message
//       showToast(response.message, "success");

//       // Reload page to show updated investments
//       setTimeout(() => {
//         window.location.reload();
//       }, 1500);
//     }
//   } catch (error) {
//     // Show error message
//     errorElement.textContent = error.message;
//     errorElement.style.display = "block";
//   } finally {
//     // Hide loading state
//     submitBtn.disabled = false;
//     submitSpinner.classList.add("d-none");
//   }
// }

// /**
//  * Apply filter to investment list
//  */
// function applyInvestmentFilter() {
//   const minAmount = document.getElementById("filterMinAmount").value;
//   const maxAmount = document.getElementById("filterMaxAmount").value;
//   const dateRange = document.getElementById("filterDateRange").value;

//   let queryParams = [];

//   // Add amount range parameters
//   if (minAmount) queryParams.push(`minAmount=${minAmount}`);
//   if (maxAmount) queryParams.push(`maxAmount=${maxAmount}`);

//   // Add date range parameters if present
//   if (dateRange) {
//     const dateParts = dateRange.split(" - ");
//     if (dateParts.length === 2) {
//       queryParams.push(`startDate=${dateParts[0]}`);
//       queryParams.push(`endDate=${dateParts[1]}`);
//     }
//   }

//   // Preserve existing limit if set
//   const urlParams = new URLSearchParams(window.location.search);
//   if (urlParams.has("limit")) {
//     queryParams.push(`limit=${urlParams.get("limit")}`);
//   }

//   // Build the query string and redirect
//   const queryString = queryParams.length > 0 ? "?" + queryParams.join("&") : "";
//   window.location.href = window.location.pathname + queryString;
// }

// /**
//  * Reset investment filters
//  */
// function resetInvestmentFilter() {
//   window.location.href = window.location.pathname;
// }

// /**
//  * Search investments
//  */
// function searchInvestments() {
//   const searchInput = document.getElementById("searchInput").value.trim();

//   if (searchInput) {
//     // Preserve existing limit if set
//     const urlParams = new URLSearchParams(window.location.search);
//     let queryParams = [`search=${searchInput}`];

//     if (urlParams.has("limit")) {
//       queryParams.push(`limit=${urlParams.get("limit")}`);
//     }

//     window.location.href =
//       window.location.pathname + "?" + queryParams.join("&");
//   }
// }

// /**
//  * Initialize investment management page functionality
//  */
// function initInvestmentPage() {
//   // Add event listeners once DOM is ready
//   document.addEventListener("DOMContentLoaded", () => {
//     // Investment detail view buttons
//     const detailButtons = document.querySelectorAll(".btn-show-details");
//     detailButtons.forEach((button) => {
//       button.addEventListener("click", function () {
//         viewInvestmentDetails(this.getAttribute("data-id"));
//       });
//     });

//     // Investment confirmation buttons
//     const confirmButtons = document.querySelectorAll(".btn-confirm-investment");
//     confirmButtons.forEach((button) => {
//       button.addEventListener("click", function (e) {
//         e.preventDefault();
//         confirmInvestment(this.getAttribute("data-id"));
//       });
//     });

//     // Investment cancellation buttons
//     const cancelButtons = document.querySelectorAll(".btn-cancel-investment");
//     cancelButtons.forEach((button) => {
//       button.addEventListener("click", function (e) {
//         e.preventDefault();
//         cancelInvestment(this.getAttribute("data-id"));
//       });
//     });

//     // Investment edit buttons
//     const editButtons = document.querySelectorAll(".btn-edit-investment");
//     editButtons.forEach((button) => {
//       button.addEventListener("click", function () {
//         editInvestment(this.getAttribute("data-id"));
//       });
//     });

//     // Save investment changes
//     const saveChangesButton = document.getElementById("saveInvestmentChanges");
//     if (saveChangesButton) {
//       saveChangesButton.addEventListener("click", saveInvestmentChanges);
//     }

//     // Apply investment filter
//     const applyFilterButton = document.getElementById("applyFilter");
//     if (applyFilterButton) {
//       applyFilterButton.addEventListener("click", applyInvestmentFilter);
//     }

//     // Reset investment filter
//     const resetFilterButton = document.getElementById("resetFilter");
//     if (resetFilterButton) {
//       resetFilterButton.addEventListener("click", resetInvestmentFilter);
//     }

//     // Search investments
//     const searchButton = document.getElementById("searchButton");
//     if (searchButton) {
//       searchButton.addEventListener("click", searchInvestments);
//     }

//     // Search on enter key
//     const searchInputField = document.getElementById("searchInput");
//     if (searchInputField) {
//       searchInputField.addEventListener("keypress", function (e) {
//         if (e.key === "Enter") {
//           searchInvestments();
//         }
//       });
//     }
//   });
// }

// // Initialize admin transactions page
// initInvestmentPage();
