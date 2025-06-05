/**
 * Client-side API functions for investment operations
 */

// Define loadCurrencies globally so it can be accessed from other scripts
window.loadCurrencies = async function () {
  try {
    const currencyOptions = document.getElementById("currency-options");
    if (!currencyOptions) return;

    // Display loading state
    currencyOptions.innerHTML = `
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

    const result = await InvestmentClient.getActiveCurrencies();

    if (result.success && result.currencies.length > 0) {
      let currencyHTML = '<div class="row g-3">';

      result.currencies.forEach((currency) => {
        currencyHTML += `
          <div class="col-md-6 col-lg-4">
            <div class="card card-bordered h-100 currency-option" data-currency-id="${
              currency._id
            }">
              <div class="card-inner">
                <div class="card-head">
                  <h6 class="card-title">${currency.name}</h6>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <span class="currency-symbol fw-bold">${
                    currency.symbol
                  }</span>
                  ${
                    currency.network
                      ? `<span class="badge bg-outline-primary ms-2">${currency.network}</span>`
                      : ""
                  }
                </div>
                <div class="text-center mt-2">
                  <button class="btn btn-dim btn-sm btn-outline-primary select-currency-btn" data-currency-id="${
                    currency._id
                  }" data-currency-name="${
          currency.name
        }" data-currency-symbol="${currency.symbol}">Select</button>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      currencyHTML += "</div>";
      currencyOptions.innerHTML = currencyHTML;

      // Add event listeners to currency selection buttons
      document.querySelectorAll(".select-currency-btn").forEach((button) => {
        button.addEventListener("click", function () {
          // Remove selected class from all options
          document.querySelectorAll(".currency-option").forEach((el) => {
            el.classList.remove("selected", "border-primary");
          });

          // Add selected class to current option
          const parentCard = this.closest(".currency-option");
          parentCard.classList.add("selected", "border-primary");

          // Store selected currency details
          window.selectedCurrency = {
            id: this.getAttribute("data-currency-id"),
            name: this.getAttribute("data-currency-name"),
            symbol: this.getAttribute("data-currency-symbol"),
          };

          // Enable next button if amount is valid
          validateForm();
        });
      });
    } else {
      currencyOptions.innerHTML =
        '<div class="text-center"><p>No payment methods available. Please contact support.</p></div>';
    }
  } catch (error) {
    console.error("Error loading currencies:", error);
    const currencyOptions = document.getElementById("currency-options");
    if (currencyOptions) {
      currencyOptions.innerHTML =
        '<div class="text-center"><p>Failed to load payment methods. Please try again later.</p></div>';
    }
  }
};

// Make validateForm accessible globally
window.validateForm = function () {
  const nextButton = document.getElementById("next-payment-btn");
  if (!nextButton) return;

  const amountValid = validateAmount();
  const currencySelected = window.selectedCurrency != null;

  nextButton.disabled = !(amountValid && currencySelected);
};

// Make validateAmount accessible globally
window.validateAmount = function () {
  const amountInput = document.getElementById("investment-amount");
  if (!amountInput) return false;

  const amount = parseFloat(amountInput.value);

  if (!window.planDetails) return false;

  if (
    isNaN(amount) ||
    amount < window.planDetails.minAmount ||
    amount > window.planDetails.maxAmount
  ) {
    amountInput.classList.add("is-invalid");
    return false;
  } else {
    amountInput.classList.remove("is-invalid");
    amountInput.classList.add("is-valid");
    window.investmentAmount = amount;
    return true;
  }
};

class InvestmentClient {
  /**
   * Get all active currencies available for investment
   * @returns {Promise} Promise object with currencies data
   */
  static async getActiveCurrencies() {
    try {
      const response = await fetch("/api/currencies/active");
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching currencies:", error);
      return { success: false, message: "Failed to fetch currencies." };
    }
  }

  /**
   * Get details of a specific plan
   * @param {string} planId - ID of the plan
   * @returns {Promise} Promise object with plan data
   */
  static async getPlanDetails(planId) {
    try {
      const response = await fetch(`/api/plans/${planId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching plan details:", error);
      return { success: false, message: "Failed to fetch plan details." };
    }
  }

  /**
   * Create a new investment
   * @param {Object} investmentData - Investment data containing planId, amount, currency, txHash
   * @returns {Promise} Promise object with investment result
   */
  static async createInvestment(investmentData) {
    try {
      const response = await fetch("/user/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(investmentData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating investment:", error);
      return { success: false, message: "Failed to create investment." };
    }
  }

  /**
   * Get user's active investments
   * @returns {Promise} Promise object with investments data
   */
  static async getUserInvestments() {
    try {
      const response = await fetch("/api/user/investments");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching investments:", error);
      return { success: false, message: "Failed to fetch investments." };
    }
  }
}

// Initialize global variables
window.selectedCurrency = null;
window.investmentAmount = 0;
window.planDetails = null;

// Document ready handler
document.addEventListener("DOMContentLoaded", function () {
  const selectCurrencyModal = document.getElementById("selectCurrencyModal");
  const paymentDetailsModal = document.getElementById("paymentDetailsModal");
  const paymentConfirmModal = document.getElementById("paymentConfirmModal");

  // Initialize Bootstrap modals
  if (selectCurrencyModal) {
    new bootstrap.Modal(selectCurrencyModal);
  }
  if (paymentDetailsModal) {
    new bootstrap.Modal(paymentDetailsModal);
  }
  if (paymentConfirmModal) {
    new bootstrap.Modal(paymentConfirmModal);
  }

  // Load plan details function - now made global
  window.loadPlanDetails = async function (planId) {
    try {
      const result = await InvestmentClient.getPlanDetails(planId);
      if (result.success) {
        window.planDetails = result.plan;

        // Update amount validation based on plan min/max
        const amountInput = document.getElementById("investment-amount");
        if (amountInput) {
          amountInput.setAttribute("min", window.planDetails.minAmount);
          amountInput.setAttribute("max", window.planDetails.maxAmount);
          amountInput.setAttribute(
            "placeholder",
            `${window.planDetails.minAmount.toFixed(
              2
            )} - ${window.planDetails.maxAmount.toFixed(2)}`
          );

          // Set validation on amount change
          amountInput.addEventListener("input", window.validateForm);
        }
      }
    } catch (error) {
      console.error("Error loading plan details:", error);
    }
  };

  // Directly attach event handlers for "Invest Now" buttons on this page
  const investButtons = document.querySelectorAll(".invest-now-btn");
  investButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const planId = this.getAttribute("data-plan-id");
      const selectedPlanInput = document.getElementById("selected-plan-id");
      if (selectedPlanInput) {
        selectedPlanInput.value = planId;
      }

      // Show the currency selection modal
      const modal = new bootstrap.Modal(
        document.getElementById("selectCurrencyModal")
      );
      modal.show();

      // Load plan details and available currencies
      window.loadPlanDetails(planId);
      window.loadCurrencies();
    });
  });

  // Add event listener to amount input for validation
  const amountInput = document.getElementById("investment-amount");
  if (amountInput) {
    amountInput.addEventListener("input", window.validateForm);
  }

  // Next button click handler - show payment details
  const nextBtn = document.getElementById("next-payment-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", async function () {
      if (!window.validateAmount() || !window.selectedCurrency) return;

      try {
        // Get complete currency details
        const response = await fetch(
          `/api/currencies/${window.selectedCurrency.id}`
        );
        const data = await response.json();
        if (data.success) {
          const currency = data.currency;

          // Update payment details modal
          document.getElementById("crypto-amount").textContent = "~"; // This would be calculated on backend
          document.getElementById("crypto-symbol").textContent =
            currency.symbol;
          document.getElementById("wallet-qrcode").src =
            currency.qrCode || "/images/qr-placeholder.png";
          document.getElementById("wallet-address").value =
            currency.walletAddress || "Address not available";
          document.getElementById("plan-name-display").textContent =
            window.planDetails ? window.planDetails.name : "";
          document.getElementById(
            "usd-amount-display"
          ).textContent = `$${window.investmentAmount.toFixed(2)}`;
          document.getElementById(
            "currency-name-display"
          ).textContent = `${currency.name} (${currency.symbol})`;

          // Hide currency selection modal
          bootstrap.Modal.getInstance(selectCurrencyModal).hide();

          // Show payment details modal
          const paymentModal = new bootstrap.Modal(paymentDetailsModal);
          paymentModal.show();
        }
      } catch (error) {
        console.error("Error fetching currency details:", error);
      }
    });
  }

  // Back button in payment details modal
  const backToCurrenciesBtn = document.getElementById("back-to-currencies");
  if (backToCurrenciesBtn) {
    backToCurrenciesBtn.addEventListener("click", function () {
      // Hide payment details modal
      bootstrap.Modal.getInstance(paymentDetailsModal).hide();

      // Show currency selection modal
      const currencyModal = new bootstrap.Modal(selectCurrencyModal);
      currencyModal.show();
    });
  }

  // Preview payment button click handler
  const previewBtn = document.getElementById("preview-payment-btn");
  if (previewBtn) {
    previewBtn.addEventListener("click", function () {
      // Update confirmation modal fields
      document.getElementById("preview-plan-name").textContent =
        window.planDetails ? window.planDetails.name : "";
      document.getElementById(
        "preview-currency-name"
      ).textContent = `${window.selectedCurrency.name} (${window.selectedCurrency.symbol})`;
      document.getElementById(
        "preview-amount-usd"
      ).textContent = `$${window.investmentAmount.toFixed(2)}`;
      document.getElementById("preview-amount-crypto").textContent = `~${
        document.getElementById("crypto-amount").textContent
      } ${window.selectedCurrency.symbol}`;
      document.getElementById("preview-wallet-address").textContent =
        document.getElementById("wallet-address").value;

      // Hide payment details modal
      bootstrap.Modal.getInstance(paymentDetailsModal).hide();

      // Show confirmation modal
      const confirmModal = new bootstrap.Modal(paymentConfirmModal);
      confirmModal.show();
    });
  }

  // Back button in confirmation modal
  const backToPaymentBtn = document.getElementById("back-to-payment");
  if (backToPaymentBtn) {
    backToPaymentBtn.addEventListener("click", function () {
      // Hide confirmation modal
      bootstrap.Modal.getInstance(paymentConfirmModal).hide();

      // Show payment details modal
      const paymentModal = new bootstrap.Modal(paymentDetailsModal);
      paymentModal.show();
    });
  }

  // Confirm payment button click handler
  const confirmBtn = document.getElementById("confirm-payment-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async function () {
      const txHash = document.getElementById("transaction-hash").value.trim();

      if (!txHash) {
        // Show validation error
        document.getElementById("transaction-hash").classList.add("is-invalid");
        return;
      }

      // Disable button to prevent multiple submissions
      confirmBtn.disabled = true;
      confirmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

      // Create investment
      const investmentData = {
        planId: document.getElementById("selected-plan-id").value,
        amount: window.investmentAmount,
        currencyId: window.selectedCurrency.id,
        txHash: txHash,
      };

      try {
        const result = await InvestmentClient.createInvestment(investmentData);

        if (result.success) {
          // Hide all modals
          if (bootstrap.Modal.getInstance(paymentConfirmModal)) {
            bootstrap.Modal.getInstance(paymentConfirmModal).hide();
          }

          // Show success message
          Swal.fire({
            icon: "success",
            title: "Investment Successful!",
            text: "Your investment request has been submitted and is pending confirmation.",
            confirmButtonText: "View Investments",
            showCancelButton: true,
            cancelButtonText: "Close",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/user/investments";
            } else {
              window.location.reload();
            }
          });
        } else {
          // Show error message
          Swal.fire({
            icon: "error",
            title: "Investment Failed",
            text:
              result.message ||
              "Failed to process investment. Please try again.",
            confirmButtonText: "OK",
          });

          // Re-enable button
          confirmBtn.disabled = false;
          confirmBtn.textContent = "Confirm Payment";
        }
      } catch (error) {
        console.error("Error creating investment:", error);

        // Show error message
        Swal.fire({
          icon: "error",
          title: "Investment Failed",
          text: "An error occurred while processing your investment. Please try again later.",
          confirmButtonText: "OK",
        });

        // Re-enable button
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm Payment";
      }
    });
  }
});
