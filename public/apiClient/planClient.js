/**
 * Client-side API functions for investment plan operations
 */

class PlanClient {
  /**
   * Get all active investment plans
   * @returns {Promise} Promise object with plans data
   */
  static async getActivePlans() {
    try {
      const response = await fetch("/api/plans/active");
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching plans:", error);
      return { success: false, message: "Failed to fetch investment plans." };
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
}

// Document ready handler
document.addEventListener("DOMContentLoaded", function () {
  // Initialize plans page if it exists
  const plansContainer = document.querySelector(".nk-block.mt-2 > .row");
  if (plansContainer) {
    loadActivePlans(plansContainer);
  }

  /**
   * Load active investment plans from API
   * @param {HTMLElement} container - Container element for plans
   */
  async function loadActivePlans(container) {
    try {
      // Display loading state
      container.innerHTML = `
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading investment plans...</p>
        </div>
      `;

      const result = await PlanClient.getActivePlans();

      if (result.success && result.plans && result.plans.length > 0) {
        // Generate HTML for plans
        let plansHTML = "";

        result.plans.forEach((plan) => {
          plansHTML += `
            <div class="col-lg-4 col-sm-6">
              <div class="card card-bordered pricing">
                <div class="card-inner-group">
                  <div class="card-inner">
                    <div class="text-center">
                      <h4>${plan.name}</h4>
                      <p>${plan.shortName ? `(${plan.shortName})` : ""}</p>
                    </div>
                    <div class="row text-center mt-4">
                      <div class="col-6">
                        <div class="plan-sum">
                          <div class="h4">${plan.roiPercentage} %</div>
                          <span class="title">${capitalizeFirst(
                            plan.roiPeriod
                          )} Interest</span>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="plan-sum">
                          <div class="amount">${plan.term}</div>
                          <span class="title">${capitalizeFirst(
                            plan.termPeriod
                          )}s (Term)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-inner">
                    <div class="row text-center">
                      <div class="col-6">
                        <div class="plan-sum">
                          <span class="title">Min Deposit</span>
                          <div class="h6">${plan.minAmount.toFixed(2)} USD</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="plan-sum">
                          <span class="title">Max Deposit</span>
                          <div class="h6">${plan.maxAmount.toFixed(2)} USD</div>
                        </div>
                      </div>
                    </div>
                    <div class="row text-center mt-2">
                      <div class="col-6">
                        <div class="plan-sum">
                          <span class="title">Capital Return</span>
                          <div class="h6">End of Term</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="plan-sum">
                          <span class="title">Investment Type</span>
                          <div class="h6">${capitalizeFirst(plan.type)}</div>
                        </div>
                      </div>
                      <div class="text-center mt-4">
                        <button class="btn btn-primary invest-now-btn" data-plan-id="${
                          plan._id
                        }">
                          <span>Invest Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });

        container.innerHTML = plansHTML;

        // Attach event listeners to the newly created buttons
        document.querySelectorAll(".invest-now-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const planId = this.getAttribute("data-plan-id");
            const selectedPlanInput =
              document.getElementById("selected-plan-id");
            if (selectedPlanInput) {
              selectedPlanInput.value = planId;
            }

            // Show the currency selection modal
            const modal = new bootstrap.Modal(
              document.getElementById("selectCurrencyModal")
            );
            modal.show();

            // Use the global functions if they exist (defined in investmentClient.js)
            if (typeof window.loadPlanDetails === "function") {
              window.loadPlanDetails(planId);
            } else {
              console.error(
                "loadPlanDetails function not found. Make sure investmentClient.js is loaded."
              );
            }

            if (typeof window.loadCurrencies === "function") {
              window.loadCurrencies();
            } else {
              console.error(
                "loadCurrencies function not found. Make sure investmentClient.js is loaded."
              );
            }
          });
        });
      } else {
        // Display message if no plans available
        container.innerHTML = `
          <div class="col-12">
            <div class="card card-bordered">
              <div class="card-inner">
                <div class="text-center">
                  <h5>No investment plans available at the moment</h5>
                  <p>Please check back later for new investment opportunities.</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      container.innerHTML = `
        <div class="col-12">
          <div class="card card-bordered">
            <div class="card-inner">
              <div class="text-center text-danger">
                <h5>Failed to load investment plans</h5>
                <p>Please try refreshing the page or contact support if the issue persists.</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Capitalize first letter of a string
   * @param {string} string - String to capitalize
   * @returns {string} Capitalized string
   */
  function capitalizeFirst(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1); 
  }
});
