/**
 * Admin Dashboard Overview Client
 * Provides functionality to fetch and display site overview data on the admin dashboard
 */

class AdminSiteOverviewClient {
  constructor() {
    this.baseUrl = "/admin/api/overview";
    this.init();
  }

  /**
   * Helper function to find elements containing text
   * @param {string} selector - CSS selector for elements to search
   * @param {string} text - Text to search for within elements
   * @returns {Element|null} - Matching element or null if not found
   */
  findElementWithText(selector, text) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      if (el.textContent.includes(text)) {
        return el;
      }
    }
    return null;
  }

  /**
   * Initialize the dashboard
   */
  async init() {
    try {
      // Load all required data
      await this.loadSiteStatistics();
      await this.loadFinancialData();
      await this.loadInvestmentOverview();
      await this.loadRecentInvestments();
      await this.loadTopPlans();
      await this.loadRecentActivities();

      // Initialize charts
      this.initCharts();

      // Add event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      NioApp.Toast(
        "Failed to load dashboard data. Please refresh the page.",
        "error"
      );
    }
  }

  /**
   * Load site statistics from the API
   */
  async loadSiteStatistics() {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`);
      if (!response.ok) {
        throw new Error("Failed to fetch site statistics");
      }

      const data = await response.json();
      if (data.success) {
        const stats = data.statistics;

        // Update the alert for pending requests
        const pendingAlert = document.querySelector(".alert.alert-primary");
        if (pendingAlert) {
          // Update referrals count
          const referralsSpan = pendingAlert.querySelector("a:nth-child(1)");
          if (referralsSpan) {
            referralsSpan.textContent = `${stats.pendingReferrals} REFERRALS`;
          }

          // Update withdrawals count
          const withdrawalsSpan = pendingAlert.querySelector("a:nth-child(2)");
          if (withdrawalsSpan) {
            withdrawalsSpan.textContent = `${stats.pendingWithdrawals} WITHDRAWALS`;
          }

          // Update deposits count
          const depositsSpan = pendingAlert.querySelector("a:nth-child(3)");
          if (depositsSpan) {
            depositsSpan.textContent = `${stats.pendingDeposits} DEPOSITS`;
          }
        }
      }
    } catch (error) {
      console.error("Error loading site statistics:", error);
    }
  }

  /**
   * Load financial data (deposits, withdrawals, wallet balance)
   */
  async loadFinancialData() {
    try {
      // Load deposits data
      const depositResponse = await fetch(`${this.baseUrl}/deposits`);
      if (!depositResponse.ok) {
        throw new Error("Failed to fetch deposit statistics");
      }

      const depositData = await depositResponse.json();

      // Load withdrawals data
      const withdrawalResponse = await fetch(`${this.baseUrl}/withdrawals`);
      if (!withdrawalResponse.ok) {
        throw new Error("Failed to fetch withdrawal statistics");
      }

      const withdrawalData = await withdrawalResponse.json();

      // Load wallet balances
      const walletResponse = await fetch(`${this.baseUrl}/wallet-balances`);
      const walletData = await walletResponse.json();

      if (depositData.success) {
        const deposits = depositData.deposits;

        // Update total deposit amount
        const totalDepositTitle = this.findElementWithText(
          ".card-title",
          "Total Deposit"
        );
        if (totalDepositTitle) {
          const cardInner = totalDepositTitle.closest(".card-inner");
          const totalDepositEl = cardInner.querySelector(".amount");

          if (totalDepositEl) {
            totalDepositEl.innerHTML = `${this.formatCurrency(
              deposits.total
            )} <span class="currency currency-usd">USD</span>`;
          }

          // Update deposit percentage change
          const depositChangeEl = cardInner.querySelector(".change");
          if (depositChangeEl) {
            depositChangeEl.innerHTML = `<em class="icon ni ni-arrow-long-${
              deposits.trend
            }"></em>${Math.abs(deposits.percentChange)}%`;
            depositChangeEl.className = `change ${
              deposits.trend === "up" ? "up" : "down"
            } text-danger`;
          }

          // Update month and week deposit amounts
          const depositHistories = cardInner.querySelectorAll(
            ".invest-data-history"
          );
          if (depositHistories.length >= 2) {
            const depositMonthEl = depositHistories[0].querySelector(".amount");
            const depositWeekEl = depositHistories[1].querySelector(".amount");

            if (depositMonthEl) {
              depositMonthEl.innerHTML = `${this.formatCurrency(
                deposits.month
              )} <span class="currency currency-usd">USD</span>`;
            }

            if (depositWeekEl) {
              depositWeekEl.innerHTML = `${this.formatCurrency(
                deposits.week
              )} <span class="currency currency-usd">USD</span>`;
            }
          }
        }

        // Store chart data for later use
        this.depositChartData = deposits.chartData;
      }

      if (withdrawalData.success) {
        const withdrawals = withdrawalData.withdrawals;

        // Update total withdrawal amount
        const totalWithdrawTitle = this.findElementWithText(
          ".card-title",
          "Total Withdraw"
        );
        if (totalWithdrawTitle) {
          const cardInner = totalWithdrawTitle.closest(".card-inner");
          const totalWithdrawEl = cardInner.querySelector(".amount");

          if (totalWithdrawEl) {
            totalWithdrawEl.innerHTML = `${this.formatCurrency(
              withdrawals.total
            )} <span class="currency currency-usd">USD</span>`;
          }

          // Update withdrawal percentage change
          const withdrawChangeEl = cardInner.querySelector(".change");
          if (withdrawChangeEl) {
            withdrawChangeEl.innerHTML = `<em class="icon ni ni-arrow-long-${
              withdrawals.trend
            }"></em>${Math.abs(withdrawals.percentChange)}%`;
            withdrawChangeEl.className = `change ${
              withdrawals.trend === "up" ? "up" : "down"
            } text-danger`;
          }

          // Update month and week withdrawal amounts
          const withdrawHistories = cardInner.querySelectorAll(
            ".invest-data-history"
          );
          if (withdrawHistories.length >= 2) {
            const withdrawMonthEl =
              withdrawHistories[0].querySelector(".amount");
            const withdrawWeekEl =
              withdrawHistories[1].querySelector(".amount");

            if (withdrawMonthEl) {
              withdrawMonthEl.innerHTML = `${this.formatCurrency(
                withdrawals.month
              )} <span class="currency currency-usd">USD</span>`;
            }

            if (withdrawWeekEl) {
              withdrawWeekEl.innerHTML = `${this.formatCurrency(
                withdrawals.week
              )} <span class="currency currency-usd">USD</span>`;
            }
          }
        }

        // Store chart data for later use
        this.withdrawalChartData = withdrawals.chartData;
      }

      if (walletData.success) {
        const wallet = walletData.wallet;

        // Update balance in account
        const balanceTitle = this.findElementWithText(
          ".card-title",
          "Balance in Account"
        );
        if (balanceTitle) {
          const cardInner = balanceTitle.closest(".card-inner");
          const balanceEl = cardInner.querySelector(".amount");

          if (balanceEl) {
            balanceEl.innerHTML = `${this.formatCurrency(
              wallet.balance
            )} <span class="currency currency-usd">USD</span>`;
          }

          // Update month and week data for balance
          const balanceHistories = cardInner.querySelectorAll(
            ".invest-data-history"
          );
          if (balanceHistories.length >= 2) {
            const balanceMonthEl = balanceHistories[0].querySelector(".amount");
            const balanceWeekEl = balanceHistories[1].querySelector(".amount");

            if (balanceMonthEl) {
              balanceMonthEl.innerHTML = `${this.formatCurrency(
                wallet.monthDeposit
              )} <span class="currency currency-usd">USD</span>`;
            }

            if (balanceWeekEl) {
              balanceWeekEl.innerHTML = `${this.formatCurrency(
                wallet.weekDeposit
              )} <span class="currency currency-usd">USD</span>`;
            }
          }
        }

        // Store chart data for later use
        this.balanceChartData = wallet.chartData;
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
    }
  }

  /**
   * Load investment overview data
   */
  async loadInvestmentOverview(period = "overview") {
    try {
      const response = await fetch(
        `${this.baseUrl}/investments?period=${period}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch investment overview");
      }

      const data = await response.json();

      if (data.success) {
        // Different tab content based on period
        let investments;
        if (period === "overview") {
          investments = data.investments.overview;

          // Update active investment tab
          const activeOverviewEl = document.querySelector("#overview");
          if (activeOverviewEl) {
            // Update active investment amount
            const activeAmountEl = activeOverviewEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-info .amount"
            );
            if (activeAmountEl) {
              activeAmountEl.innerHTML = `${this.formatCurrency(
                investments.activeAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update active plans count
            const activePlansEl = activeOverviewEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-stats .amount"
            );
            if (activePlansEl) {
              activePlansEl.textContent = investments.activePlans;
            }

            // Update active change percentage
            const activeChangeEl = activePlansEl?.nextElementSibling;
            if (activeChangeEl) {
              activeChangeEl.innerHTML = `<em class="icon ni ni-arrow-long-${
                investments.activeTrend
              }"></em>${Math.abs(investments.activePercentChange)}%`;
              activeChangeEl.className = `change ${investments.activeTrend} text-danger`;
            }

            // Update paid profit
            const paidProfitEl = activeOverviewEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-details:nth-child(2) .invest-ov-info .amount"
            );
            if (paidProfitEl) {
              paidProfitEl.innerHTML = `${this.formatCurrency(
                investments.paidProfitAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update this month's investment
            const monthInvestmentEl = activeOverviewEl.querySelector(
              ".invest-ov:nth-child(2) .invest-ov-info .amount"
            );
            if (monthInvestmentEl) {
              monthInvestmentEl.innerHTML = `${this.formatCurrency(
                investments.monthAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update this month's plans count
            const monthPlansEl = activeOverviewEl.querySelector(
              ".invest-ov:nth-child(2) .invest-ov-stats .amount"
            );
            if (monthPlansEl) {
              monthPlansEl.textContent = investments.monthPlans;
            }

            // Update month change percentage
            const monthChangeEl = monthPlansEl?.nextElementSibling;
            if (monthChangeEl) {
              monthChangeEl.innerHTML = `<em class="icon ni ni-arrow-long-${
                investments.monthTrend
              }"></em>${Math.abs(investments.monthPercentChange)}%`;
              monthChangeEl.className = `change ${investments.monthTrend} text-danger`;
            }
          }
        } else if (period === "thisyear") {
          investments = data.investments.thisYear;

          // Update this year tab
          const yearTabEl = document.querySelector("#thisyear");
          if (yearTabEl) {
            // Update active investment amount
            const activeAmountEl = yearTabEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-info .amount"
            );
            if (activeAmountEl) {
              activeAmountEl.innerHTML = `${this.formatCurrency(
                investments.activeAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update active plans count
            const activePlansEl = yearTabEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-stats .amount"
            );
            if (activePlansEl) {
              activePlansEl.textContent = investments.activePlans;
            }

            // Update paid profit
            const paidProfitEl = yearTabEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-details:nth-child(2) .invest-ov-info .amount"
            );
            if (paidProfitEl) {
              paidProfitEl.innerHTML = `${this.formatCurrency(
                investments.paidProfitAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update year investment
            const yearInvestmentEl = yearTabEl.querySelector(
              ".invest-ov:nth-child(2) .invest-ov-info .amount"
            );
            if (yearInvestmentEl) {
              yearInvestmentEl.innerHTML = `${this.formatCurrency(
                investments.monthAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update year plans count
            const yearPlansEl = yearTabEl.querySelector(
              ".invest-ov:nth-child(2) .invest-ov-stats .amount"
            );
            if (yearPlansEl) {
              yearPlansEl.textContent = investments.monthPlans;
            }
          }
        } else if (period === "alltime") {
          investments = data.investments.allTime;

          // Update all time tab
          const allTimeTabEl = document.querySelector("#alltime");
          if (allTimeTabEl) {
            // Update active investment amount
            const activeAmountEl = allTimeTabEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-info .amount"
            );
            if (activeAmountEl) {
              activeAmountEl.innerHTML = `${this.formatCurrency(
                investments.activeAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update active plans count
            const activePlansEl = allTimeTabEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-stats .amount"
            );
            if (activePlansEl) {
              activePlansEl.textContent = investments.activePlans;
            }

            // Update paid profit
            const paidProfitEl = allTimeTabEl.querySelector(
              ".invest-ov:nth-child(1) .invest-ov-details:nth-child(2) .invest-ov-info .amount"
            );
            if (paidProfitEl) {
              paidProfitEl.innerHTML = `${this.formatCurrency(
                investments.paidProfitAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update total investment
            const totalInvestmentEl = allTimeTabEl.querySelector(
              ".invest-ov:nth-child(2) .invest-ov-info .amount"
            );
            if (totalInvestmentEl) {
              totalInvestmentEl.innerHTML = `${this.formatCurrency(
                investments.totalAmount
              )} <span class="currency currency-usd">USD</span>`;
            }

            // Update total plans count
            const totalPlansEl = allTimeTabEl.querySelector(
              ".invest-ov:nth-child(2) .invest-ov-stats .amount"
            );
            if (totalPlansEl) {
              totalPlansEl.textContent = investments.totalPlans;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading investment overview:", error);
    }
  }

  /**
   * Load recent investments
   */
  async loadRecentInvestments() {
    try {
      const response = await fetch(`${this.baseUrl}/recent-investments`);
      if (!response.ok) {
        throw new Error("Failed to fetch recent investments");
      }

      const data = await response.json();

      if (data.success && data.investments.length > 0) {
        const tableBody = document.querySelector(".nk-tb-list");
        if (tableBody) {
          // Clear existing items except the header
          const header = tableBody.querySelector(".nk-tb-item.nk-tb-head");
          tableBody.innerHTML = "";
          if (header) tableBody.appendChild(header);

          // Add new items
          data.investments.forEach((investment) => {
            const planName = investment.planId?.name || "Unknown Plan";
            const planDetails = `${planName} - Daily ${
              investment.planId?.roiPercentage || 0
            }% for ${investment.planId?.term || 0} ${
              investment.planId?.termPeriod || "Days"
            }`;
            const user = investment.userId?.fullName || "Unknown User";
            const userInitials = user
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            const date = new Date(investment.createdAt).toLocaleDateString();
            const amount = this.formatCurrency(investment.amount);
            const currency = investment.currency || "USD";

            const progress =
              investment.status === "active"
                ? Math.floor(Math.random() * 100)
                : 100;
            const statusText =
              investment.status === "active"
                ? `<div class="progress progress-sm w-80px"><div class="progress-bar" data-progress="${progress}"></div></div>`
                : '<span class="tb-sub text-success">Completed</span>';

            const itemHTML = `
              <div class="nk-tb-item">
                <div class="nk-tb-col">
                  <div class="align-center">
                    <div class="user-avatar user-avatar-sm bg-light">
                      <span>P${investment.planId?._id.slice(-1) || "1"}</span>
                    </div>
                    <span class="tb-sub ms-2">${planName}
                      <span class="d-none d-md-inline">- Daily ${
                        investment.planId?.roiPercentage || 0
                      }% for ${investment.planId?.term || 0} ${
              investment.planId?.termPeriod || "Days"
            }</span>
                    </span>
                  </div>
                </div>
                <div class="nk-tb-col tb-col-sm">
                  <div class="user-card">
                    <div class="user-avatar user-avatar-xs bg-${this.getRandomColor()}-dim">
                      <span>${userInitials}</span>
                    </div>
                    <div class="user-name">
                      <span class="tb-lead">${user}</span>
                    </div>
                  </div>
                </div>
                <div class="nk-tb-col tb-col-lg">
                  <span class="tb-sub">${date}</span>
                </div>
                <div class="nk-tb-col">
                  <span class="tb-sub tb-amount">${amount} <span>${currency}</span></span>
                </div>
                <div class="nk-tb-col tb-col-sm">
                  ${statusText}
                </div>
                <div class="nk-tb-col nk-tb-col-action">
                  <div class="dropdown">
                    <a class="text-soft dropdown-toggle btn btn-sm btn-icon btn-trigger" data-bs-toggle="dropdown"><em class="icon ni ni-chevron-right"></em></a>
                    <div class="dropdown-menu dropdown-menu-end dropdown-menu-xs">
                      <ul class="link-list-plain">
                        <li><a href="/admin/investments/${
                          investment._id
                        }">View</a></li>
                        <li><a href="#">Print</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            `;

            tableBody.insertAdjacentHTML("beforeend", itemHTML);
          });

          // Initialize progress bars
          NioApp.BS.progress();
        }
      }
    } catch (error) {
      console.error("Error loading recent investments:", error);
    }
  }

  /**
   * Load top invested plans
   */
  async loadTopPlans(period = "30") {
    try {
      const response = await fetch(
        `${this.baseUrl}/top-plans?period=${period}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch top plans");
      }

      const data = await response.json();
      console.log("Top Plans Data:", data);

      if (data.success && data.topPlans.length > 0) {
        const topPlansContainer = document.querySelector(".progress-list");
        if (topPlansContainer) {
          // Clear existing plans
          topPlansContainer.innerHTML = "";

          // Add top plans
          data.topPlans.forEach((plan, index) => {
            const colorClasses = [
              "bg-orange",
              "bg-teal",
              "bg-pink",
              "bg-azure",
            ];
            const colorClass = colorClasses[index % colorClasses.length];
            console.log("Color Class:", colorClass);

            const planHTML = `
              <div class="progress-wrap">
                <div class="progress-text">
                  <div class="progress-label">${plan.planName}</div>
                  <div class="progress-amount">${plan.percentage}%</div>
                </div>
                <div class="progress progress-md">
                  <div class="progress-bar ${colorClass}" data-progress="${plan.percentage}"></div>
                </div>
              </div>
            `;

            topPlansContainer.insertAdjacentHTML("beforeend", planHTML);
          });

          // Manually initialize progress bars
          const progressBars =
            topPlansContainer.querySelectorAll(".progress-bar");
          progressBars.forEach((bar) => {
            const progress = bar.getAttribute("data-progress");
            if (progress) {
              bar.style.width = `${progress}%`;
            }
          });

          // Also try NioApp initialization if available
          if (
            typeof NioApp !== "undefined" &&
            NioApp.BS &&
            typeof NioApp.BS.progress === "function"
          ) {
            NioApp.BS.progress();
          }

          // Store chart data for later use
          this.topPlansData = data.topPlans;
        }
      }
    } catch (error) {
      console.error("Error loading top invested plans:", error);
    }
  }

  /**
   * Load recent activities
   */
  async loadRecentActivities(type = "all") {
    try {
      const response = await fetch(
        `${this.baseUrl}/recent-activities?type=${type}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recent activities");
      }

      const data = await response.json();
      if (data.success && data.activities.length > 0) {
        const activitiesContainer = document.querySelector("ul.nk-activity");
        if (activitiesContainer) {
          // Clear existing activities
          activitiesContainer.innerHTML = "";

          // Add activities
          data.activities.forEach((activity) => {
            const timeAgo = this.timeAgo(new Date(activity.time));
            const userInitials = activity.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            const typeClass =
              activity.type === "withdrawal"
                ? "bg-success"
                : activity.type === "deposit"
                ? "bg-warning"
                : "bg-azure";

            const activityHTML = `
              <li class="nk-activity-item">
                <div class="nk-activity-media user-avatar ${typeClass}">
                  ${userInitials}
                </div>
                <div class="nk-activity-data">
                  <div class="label">
                    ${activity.description}
                  </div>
                  <span class="time">${timeAgo}</span>
                </div>
              </li>
            `;

            activitiesContainer.insertAdjacentHTML("beforeend", activityHTML);
          });
        }
      }
    } catch (error) {
      console.error("Error loading recent activities:", error);
    }
  }

  /**
   * Initialize charts on the dashboard
   */
  initCharts() {
    // Ensure NioApp and Chart.js are available
    if (typeof NioApp === "undefined" || typeof Chart === "undefined") {
      console.warn(
        "NioApp or Chart.js not available, charts will not be initialized"
      );
      return;
    }

    // Initialize deposit chart
    if (this.depositChartData) {
      const depositCtx = document.getElementById("totalDeposit");
      if (depositCtx) {
        const depositChart = new Chart(depositCtx, {
          type: "line",
          data: {
            labels: this.depositChartData.map((d) => d.month),
            datasets: [
              {
                label: "Total Deposits",
                color: "#733AEA",
                data: this.depositChartData.map((d) => d.amount),
                borderWidth: 2,
                borderColor: "#733AEA",
                backgroundColor: "transparent",
                pointBorderColor: "transparent",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#733AEA",
                pointHoverBorderColor: "#733AEA",
                pointBorderWidth: 2,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 4,
                tension: 0.3,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (context) {
                    return `$${context.parsed.y.toFixed(2)}`;
                  },
                },
                backgroundColor: "#fff",
                titleFontSize: 13,
                titleFontColor: "#6783b8",
                titleMarginBottom: 6,
                bodyFontColor: "#9eaecf",
                bodyFontSize: 12,
                bodySpacing: 4,
                yPadding: 10,
                xPadding: 10,
                footerMarginTop: 0,
                displayColors: false,
              },
            },
            scales: {
              y: {
                display: false,
              },
              x: {
                display: false,
              },
            },
            maintainAspectRatio: false,
          },
        });
      }
    }

    // Initialize withdrawal chart
    if (this.withdrawalChartData) {
      const withdrawCtx = document.getElementById("totalWithdraw");
      if (withdrawCtx) {
        const withdrawChart = new Chart(withdrawCtx, {
          type: "line",
          data: {
            labels: this.withdrawalChartData.map((d) => d.month),
            datasets: [
              {
                label: "Total Withdrawals",
                color: "#FF65A0",
                data: this.withdrawalChartData.map((d) => d.amount),
                borderWidth: 2,
                borderColor: "#FF65A0",
                backgroundColor: "transparent",
                pointBorderColor: "transparent",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#FF65A0",
                pointHoverBorderColor: "#FF65A0",
                pointBorderWidth: 2,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 4,
                tension: 0.3,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (context) {
                    return `$${context.parsed.y.toFixed(2)}`;
                  },
                },
                backgroundColor: "#fff",
                titleFontSize: 13,
                titleFontColor: "#6783b8",
                titleMarginBottom: 6,
                bodyFontColor: "#9eaecf",
                bodyFontSize: 12,
                bodySpacing: 4,
                yPadding: 10,
                xPadding: 10,
                footerMarginTop: 0,
                displayColors: false,
              },
            },
            scales: {
              y: {
                display: false,
              },
              x: {
                display: false,
              },
            },
            maintainAspectRatio: false,
          },
        });
      }
    }

    // Initialize balance chart
    if (this.balanceChartData) {
      const balanceCtx = document.getElementById("totalBalance");
      if (balanceCtx) {
        const balanceChart = new Chart(balanceCtx, {
          type: "line",
          data: {
            labels: this.balanceChartData.map((d) => d.month),
            datasets: [
              {
                label: "Total Balance",
                color: "#5CE0AA",
                data: this.balanceChartData.map((d) => d.amount),
                borderWidth: 2,
                borderColor: "#5CE0AA",
                backgroundColor: "transparent",
                pointBorderColor: "transparent",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#5CE0AA",
                pointHoverBorderColor: "#5CE0AA",
                pointBorderWidth: 2,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 4,
                tension: 0.3,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (context) {
                    return `$${context.parsed.y.toFixed(2)}`;
                  },
                },
                backgroundColor: "#fff",
                titleFontSize: 13,
                titleFontColor: "#6783b8",
                titleMarginBottom: 6,
                bodyFontColor: "#9eaecf",
                bodyFontSize: 12,
                bodySpacing: 4,
                yPadding: 10,
                xPadding: 10,
                footerMarginTop: 0,
                displayColors: false,
              },
            },
            scales: {
              y: {
                display: false,
              },
              x: {
                display: false,
              },
            },
            maintainAspectRatio: false,
          },
        });
      }
    }

    // Initialize plan purchase chart
    if (this.topPlansData) {
      const planPurchaseCtx = document.getElementById("planPurchase");
      if (planPurchaseCtx) {
        const colors = ["#733AEA", "#FF65A0", "#5CE0AA", "#FF9500", "#5E44FD"];
        const planPurchaseChart = new Chart(planPurchaseCtx, {
          type: "doughnut",
          data: {
            labels: this.topPlansData.map((p) => p.planName),
            datasets: [
              {
                label: "Plan Purchases",
                data: this.topPlansData.map((p) => p.percentage),
                backgroundColor: colors.slice(0, this.topPlansData.length),
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (context) {
                    return `${context.label}: ${context.parsed}%`;
                  },
                },
              },
            },
            rotation: -90,
            circumference: 180,
            cutout: "60%",
            maintainAspectRatio: false,
          },
        });
      }
    }
  }

  /**
   * Set up event listeners for the dashboard
   */
  setupEventListeners() {
    // Investment overview tab switching
    const tabs = document.querySelectorAll(".nav-tabs-card .nav-link");
    if (tabs) {
      tabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const target = e.target.getAttribute("href");
          if (target === "#overview") {
            this.loadInvestmentOverview("overview");
          } else if (target === "#thisyear") {
            this.loadInvestmentOverview("thisyear");
          } else if (target === "#alltime") {
            this.loadInvestmentOverview("alltime");
          }
        });
      });
    }

    // Top plans period switching
    const planPeriodDropdown = document.querySelector(
      ".dropdown-menu.dropdown-menu-sm"
    );
    if (planPeriodDropdown) {
      const periodLinks = planPeriodDropdown.querySelectorAll("a");
      periodLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const period = e.target.textContent.trim();
          let periodDays = "30";

          if (period === "15 Days") {
            periodDays = "15";
          } else if (period === "30 Days") {
            periodDays = "30";
          } else if (period === "3 Months") {
            periodDays = "90";
          }

          this.loadTopPlans(periodDays);

          // Update active state
          periodLinks.forEach((pl) => pl.classList.remove("active"));
          e.target.classList.add("active");
        });
      });
    }

    // Recent activities filter
    const activityFilters = document.querySelector(".card-tools-nav");
    if (activityFilters) {
      const filterLinks = activityFilters.querySelectorAll("a");
      filterLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const type = e.target.textContent.trim().toLowerCase();

          if (type === "all") {
            this.loadRecentActivities("all");
          } else if (type === "cancel") {
            this.loadRecentActivities("withdrawal");
          }

          // Update active state
          filterLinks.forEach((fl) =>
            fl.parentElement.classList.remove("active")
          );
          e.target.parentElement.classList.add("active");
        });
      });
    }
  }

  /**
   * Format currency values
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Generate relative time string
   * @param {Date} date - Date to convert to relative time
   * @returns {string} - Relative time string
   */
  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + " years ago";
    }
    if (interval === 1) {
      return "1 year ago";
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months ago";
    }
    if (interval === 1) {
      return "1 month ago";
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days ago";
    }
    if (interval === 1) {
      return "1 day ago";
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours ago";
    }
    if (interval === 1) {
      return "1 hour ago";
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes ago";
    }
    if (interval === 1) {
      return "1 minute ago";
    }

    if (seconds < 10) {
      return "just now";
    }

    return Math.floor(seconds) + " seconds ago";
  }

  /**
   * Get random color for user avatars
   * @returns {string} - Color name
   */
  getRandomColor() {
    const colors = [
      "primary",
      "secondary",
      "success",
      "info",
      "warning",
      "danger",
      "dark",
      "gray",
      "light",
      "lighter",
      "purple",
      "pink",
      "orange",
      "teal",
      "blue",
      "azure",
      "indigo",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Initialize the dashboard overview when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the admin dashboard page
  if (
    document
      .querySelector(
        ".nk-content-body .nk-block-head .nk-block-title.page-title"
      )
      ?.textContent.trim() === "Overview"
  ) {
    new AdminSiteOverviewClient();
  }
});
