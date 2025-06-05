/**
 * ExNestrade Transaction Utility Functions
 * Handles deposit and withdrawal transactions in the frontend
 */

/**
 * Handle deposit form submission
 * @param {Event} event - Form submission event
 */
async function handleDepositSubmit(event) {
  event.preventDefault();
  
  const depositButton = document.getElementById("submitDeposit");
  const depositSpinner = document.getElementById("depositSpinner");
  const depositError = document.getElementById("depositError");
  
  // Show loading state
  depositButton.disabled = true;
  depositSpinner.classList.remove("d-none");
  depositError.style.display = "none";

  try {
    const amount = document.getElementById("depositAmount").value;
    const walletAddress = document.getElementById("depositWallet").value;

    // Simple validation
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }

    const response = await apiPost("/user/api/deposit", { 
      amount, 
      walletAddress 
    });
    
    if (response.success) {
      // Hide the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("depositModal"));
      modal.hide();
      
      // Show success message
      showToast(response.message, "success");
      
      // Reload page to show updated transactions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (error) {
    // Show error message
    depositError.textContent = error.message;
    depositError.style.display = "block";
  } finally {
    // Hide loading state
    depositButton.disabled = false;
    depositSpinner.classList.add("d-none");
  }
}

/**
 * Handle withdrawal form submission
 * @param {Event} event - Form submission event
 */
async function handleWithdrawalSubmit(event) {
  event.preventDefault();
  
  const withdrawalButton = document.getElementById("submitWithdrawal");
  const withdrawalSpinner = document.getElementById("withdrawalSpinner");
  const withdrawalError = document.getElementById("withdrawalError");
  
  // Show loading state
  withdrawalButton.disabled = true;
  withdrawalSpinner.classList.remove("d-none");
  withdrawalError.style.display = "none";

  try {
    const amount = document.getElementById("withdrawalAmount").value;
    const walletAddress = document.getElementById("withdrawalWallet").value;

    // Simple validation
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("Please enter a valid amount");
    }
    
    if (!walletAddress) {
      throw new Error("Please enter a wallet address");
    }

    const response = await apiPost("/user/api/withdraw", { 
      amount, 
      walletAddress 
    });
    
    if (response.success) {
      // Hide the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("withdrawalModal"));
      modal.hide();
      
      // Show success message
      showToast(response.message, "success");
      
      // Reload page to show updated transactions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (error) {
    // Show error message
    withdrawalError.textContent = error.message;
    withdrawalError.style.display = "block";
  } finally {
    // Hide loading state
    withdrawalButton.disabled = false;
    withdrawalSpinner.classList.add("d-none");
  }
}

/**
 * Set the maximum withdrawal amount
 * @param {Event} event - Click event
 */
function setMaxWithdrawal(event) {
  event.preventDefault();
  const currentBalance = document.getElementById("currentBalance").value;
  document.getElementById("withdrawalAmount").value = currentBalance;
}

/**
 * Cancel a withdrawal request
 * @param {string} txId - Transaction ID
 */
async function cancelWithdrawal(txId) {
  if (!confirm("Are you sure you want to cancel this withdrawal request?")) {
    return;
  }
  
  // Show loading state
  document.body.style.cursor = 'wait';
  
  try {
    const response = await apiPost(`/user/api/cancel-withdrawal/${txId}`);
    
    if (response.success) {
      showToast("Withdrawal cancelled successfully", "success");
      
      // Hide the modal if open
      const tranxModal = bootstrap.Modal.getInstance(
        document.getElementById("tranxDetails")
      );
      if (tranxModal) {
        tranxModal.hide();
      }
      
      // Reload the page to refresh the transactions list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showToast("Error: " + response.message, "error");
    }
  } catch (error) {
    showToast("An error occurred: " + error.message, "error");
  } finally {
    document.body.style.cursor = 'default';
  }
}

/**
 * View transaction details
 * @param {string} txId - Transaction ID
 */
async function viewTransactionDetails(txId) {
  try {
    // Fetch transaction details from API
    const data = await apiGet(`/user/api/transaction/${txId}`);
    
    if (data.success) {
      const tx = data.transaction;

      // Set transaction details in the modal
      document.getElementById("txDetailId").textContent =
        tx._id.substring(0, 8);
      document.getElementById("txDetailTxId").textContent = tx._id;
      document.getElementById("txDetailType").textContent =
        tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
      document.getElementById("txDetailTime").textContent = new Date(
        tx.createdAt
      ).toLocaleString();
      document.getElementById("txDetailFee").textContent =
        "0.00000000 BTC";

      const amount = (tx.amount / 100000000).toFixed(8);
      document.getElementById("txDetailAmountOnly").textContent =
        amount + " BTC";

      // Set prefix (+ or -) based on transaction type
      const isIncoming =
        tx.type === "deposit" ||
        tx.type === "earnings" ||
        tx.type === "referral";
      document.getElementById("txDetailAmount").textContent =
        (isIncoming ? "+ " : "- ") + amount + " BTC";

      // Set status button class
      const statusBtn = document.getElementById("txDetailStatus");
      statusBtn.textContent =
        tx.status.charAt(0).toUpperCase() + tx.status.slice(1);

      statusBtn.className = "btn";
      if (tx.status === "completed") {
        statusBtn.classList.add("btn-success");
      } else if (tx.status === "pending") {
        statusBtn.classList.add("btn-warning");
      } else if (tx.status === "cancelled" || tx.status === "failed") {
        statusBtn.classList.add("btn-danger");
      } else {
        statusBtn.classList.add("btn-secondary");
      }

      // Set transaction icon
      const txIcon = document.getElementById("txDetailIcon");
      txIcon.className = "nk-tnx-type-icon text-white";
      let iconClass = "ni ni-tranx";

      if (tx.type === "deposit") {
        txIcon.classList.add("bg-success-dim");
        iconClass = "ni-arrow-down-left";
      } else if (tx.type === "withdrawal") {
        txIcon.classList.add("bg-danger-dim");
        iconClass = "ni-arrow-up-right";
      } else if (tx.type === "investment") {
        txIcon.classList.add("bg-warning-dim");
        iconClass = "ni-invest";
      } else if (tx.type === "earnings") {
        txIcon.classList.add("bg-info-dim");
        iconClass = "ni-growth";
      } else if (tx.type === "referral") {
        txIcon.classList.add("bg-primary-dim");
        iconClass = "ni-users";
      } else {
        txIcon.classList.add("bg-gray-dim");
      }

      document.getElementById(
        "txDetailIcon"
      ).innerHTML = `<em class="icon ${iconClass}"></em>`;

      // Handle wallet address display
      const walletContainer = document.getElementById(
        "txWalletAddressContainer"
      );
      const walletLabel = document.getElementById(
        "txWalletAddressLabel"
      );
      const walletAddress = document.getElementById("txDetailWallet");

      if (tx.walletAddress) {
        walletContainer.style.display = "block";
        if (tx.type === "withdrawal") {
          walletLabel.textContent = "Destination Address";
        } else {
          walletLabel.textContent = "Source Address";
        }
        walletAddress.textContent = tx.walletAddress;
      } else {
        walletContainer.style.display = "none";
      }

      // Set description
      let description = tx.description || "";
      if (!description) {
        if (tx.type === "deposit") {
          description = "Deposit funds to wallet";
        } else if (tx.type === "withdrawal") {
          description = "Withdraw funds from wallet";
        } else if (tx.type === "investment") {
          description = "Investment in plan";
        } else if (tx.type === "earnings") {
          description = "Earnings from investment";
        } else if (tx.type === "referral") {
          description = "Referral commission";
        }
      }
      document.getElementById("txDetailDesc").textContent = description;

      // Show action button for pending withdrawals
      const actionContainer =
        document.getElementById("txActionContainer");
      const actionButton = document.getElementById("txActionButton");

      if (tx.type === "withdrawal" && tx.status === "pending") {
        actionContainer.style.display = "block";
        actionButton.textContent = "Cancel Withdrawal";
        actionButton.onclick = function () {
          cancelWithdrawal(tx._id);
        };
      } else {
        actionContainer.style.display = "none";
      }

      // Show the modal
      const tranxModal = new bootstrap.Modal(
        document.getElementById("tranxDetails")
      );
      tranxModal.show();
    } else {
      showToast("Error: " + data.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("An error occurred while fetching transaction details", "error");
  }
}

/**
 * Initialize transaction page functionality
 */
function initTransactionPage() {
  // Add event listeners once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Deposit form submission
    const submitDepositBtn = document.getElementById("submitDeposit");
    if (submitDepositBtn) {
      submitDepositBtn.addEventListener("click", handleDepositSubmit);
    }
    
    // Withdrawal form submission
    const submitWithdrawalBtn = document.getElementById("submitWithdrawal");
    if (submitWithdrawalBtn) {
      submitWithdrawalBtn.addEventListener("click", handleWithdrawalSubmit);
    }
    
    // Set max withdrawal amount
    const withdrawMaxBtn = document.getElementById("withdrawMax");
    if (withdrawMaxBtn) {
      withdrawMaxBtn.addEventListener("click", setMaxWithdrawal);
    }
    
    // Filter transactions
    const applyFilterBtn = document.getElementById("applyFilter");
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener("click", function() {
        const type = document.getElementById("filterType").value;
        const status = document.getElementById("filterStatus").value;

        let queryParams = [];
        if (type !== "all") {
          queryParams.push(`type=${type}`);
        }
        if (status !== "all") {
          queryParams.push(`status=${status}`);
        }

        const queryString = queryParams.length > 0 ? "?" + queryParams.join("&") : "";
        window.location.href = `/user/transactions${queryString}`;
      });
    }
    
    // Reset filters
    const resetFilterBtn = document.getElementById("resetFilter");
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", function() {
        window.location.href = "/user/transactions";
      });
    }
    
    // Search transactions
    const searchInput = document.getElementById("searchTransaction");
    if (searchInput) {
      searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          const search = this.value.trim();
          if (search) {
            window.location.href = `/user/transactions?search=${search}`;
          }
        }
      });
    }
  });
}

// Initialize transaction page
initTransactionPage();