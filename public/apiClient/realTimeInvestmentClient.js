/**
 * Real-time Investment Client
 * Manages real-time investment calculations and updates
 */

class RealTimeInvestmentTracker {
  constructor() {
    this.investments = [];
    this.updateIntervals = {};
    this.initialized = false;
  }

  /**
   * Initialize the investment tracker with active investments
   * @param {Array} investments - List of active investments
   */
  init(investments) {
    if (!investments || !Array.isArray(investments)) {
      console.error("Invalid investments data");
      return;
    }

    this.investments = investments;
    this.initialized = true;

    // Start tracking all investments
    this.investments.forEach((investment) => {
      this.startTracking(investment);
    });

    console.log(
      `Initialized investment tracker with ${investments.length} investments`
    );
  }

  /**
   * Start tracking a specific investment
   * @param {Object} investment - Investment object
   */
  startTracking(investment) {
    // Skip if already tracking this investment
    if (this.updateIntervals[investment._id]) {
      return;
    }

    // Calculate time units in seconds based on duration unit
    const timeUnitInSeconds = this._getTimeUnitInSeconds(
      investment.durationUnit
    );

    // Calculate total duration in seconds
    const totalDurationInSeconds = investment.duration * timeUnitInSeconds;

    // Calculate earning rate per second
    const totalEarningRate = investment.earningRate;
    const earningRatePerSecond = totalEarningRate / totalDurationInSeconds;

    // Calculate time remaining (if already started)
    let timeRemainingSeconds = totalDurationInSeconds;

    if (investment.startDate && investment.endDate) {
      const now = new Date();
      const startDate = new Date(investment.startDate);
      const endDate = new Date(investment.endDate);

      // Check if investment is still active
      if (now < endDate) {
        const elapsedTime = (now - startDate) / 1000; // in seconds
        timeRemainingSeconds = totalDurationInSeconds - elapsedTime;
      } else {
        timeRemainingSeconds = 0;
      }
    }

    // Store the investment data
    investment.earningRatePerSecond = earningRatePerSecond;
    investment.totalDurationInSeconds = totalDurationInSeconds;
    investment.timeRemainingSeconds = timeRemainingSeconds;
    investment.accumulatedEarnings = this._calculateCurrentEarnings(investment);

    // Create an element for displaying the earnings if it doesn't exist
    const earningsEl = document.getElementById(`earnings-${investment._id}`);
    const timeRemainingEl = document.getElementById(
      `time-remaining-${investment._id}`
    );

    if (earningsEl && timeRemainingEl) {
      // Start the update interval
      this.updateIntervals[investment._id] = setInterval(() => {
        this._updateInvestment(investment, earningsEl, timeRemainingEl);
      }, 1000);
    }
  }

  /**
   * Stop tracking a specific investment
   * @param {string} investmentId - Investment ID
   */
  stopTracking(investmentId) {
    if (this.updateIntervals[investmentId]) {
      clearInterval(this.updateIntervals[investmentId]);
      delete this.updateIntervals[investmentId];
    }
  }

  /**
   * Stop tracking all investments
   */
  stopAll() {
    Object.keys(this.updateIntervals).forEach((investmentId) => {
      this.stopTracking(investmentId);
    });
  }

  /**
   * Calculate current earnings for an investment
   * @param {Object} investment - Investment object
   * @returns {number} Current earnings
   */
  _calculateCurrentEarnings(investment) {
    if (!investment.startDate || !investment.endDate) {
      return 0;
    }

    const now = new Date();
    const startDate = new Date(investment.startDate);

    // If investment hasn't started yet, return 0
    if (now < startDate) {
      return 0;
    }

    const endDate = new Date(investment.endDate);

    // If investment is complete, return full earnings
    if (now >= endDate) {
      return investment.amount * investment.earningRate;
    }

    // Calculate elapsed time as a fraction of total duration
    const elapsedTime = (now - startDate) / 1000; // in seconds
    const elapsedFraction = elapsedTime / investment.totalDurationInSeconds;

    // Calculate current earnings
    return investment.amount * investment.earningRate * elapsedFraction;
  }

  /**
   * Update investment display with current earnings and time remaining
   * @param {Object} investment - Investment object
   * @param {HTMLElement} earningsEl - Element to display earnings
   * @param {HTMLElement} timeRemainingEl - Element to display time remaining
   */
  _updateInvestment(investment, earningsEl, timeRemainingEl) {
    const now = new Date();
    const endDate = new Date(investment.endDate);

    // If investment is complete, show final values and stop tracking
    if (now >= endDate) {
      const finalEarnings = investment.amount * investment.earningRate;
      earningsEl.textContent = `$${finalEarnings.toFixed(4)}`;
      timeRemainingEl.textContent = "Complete";

      // Stop tracking this investment
      this.stopTracking(investment._id);
      return;
    }

    // Update time remaining
    investment.timeRemainingSeconds -= 1;

    // Update accumulated earnings
    investment.accumulatedEarnings +=
      investment.amount * investment.earningRatePerSecond;

    // Update display
    earningsEl.textContent = `$${investment.accumulatedEarnings.toFixed(4)}`;
    timeRemainingEl.textContent = this._formatTimeRemaining(
      investment.timeRemainingSeconds
    );
  }

  /**
   * Format time remaining in human-readable format
   * @param {number} seconds - Time remaining in seconds
   * @returns {string} Formatted time string
   */
  _formatTimeRemaining(seconds) {
    if (seconds <= 0) {
      return "Complete";
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let timeString = "";

    if (days > 0) {
      timeString += `${days}d `;
    }

    if (hours > 0 || days > 0) {
      timeString += `${hours}h `;
    }

    if (minutes > 0 || hours > 0 || days > 0) {
      timeString += `${minutes}m `;
    }

    timeString += `${remainingSeconds}s`;

    return timeString;
  }

  /**
   * Get time unit in seconds based on duration unit
   * @param {string} durationUnit - Duration unit (hour, day, week, month)
   * @returns {number} Time unit in seconds
   */
  _getTimeUnitInSeconds(durationUnit) {
    switch (durationUnit) {
      case "hour":
        return 3600; // 60 * 60 seconds
      case "day":
        return 86400; // 24 * 60 * 60 seconds
      case "week":
        return 604800; // 7 * 24 * 60 * 60 seconds
      case "month":
        return 2592000; // 30 * 24 * 60 * 60 seconds (approximation)
      default:
        return 86400; // default to days
    }
  }
}

// Create a global instance of the investment tracker
const investmentTracker = new RealTimeInvestmentTracker();

/**
 * Initialize the investment tracker with active investments
 * @param {Array} investments - List of active investments
 */
function initInvestmentTracker(investments) {
  investmentTracker.init(investments);
}

/**
 * Get user's active investments from API
 * @returns {Promise<Array>} List of active investments
 */
async function fetchActiveInvestments() {
  try {
    const response = await apiGet("/user/investments?status=active");
    return response.investments || [];
  } catch (error) {
    console.error("Error fetching active investments:", error);
    showToast("Failed to load active investments", "error");
    return [];
  }
}

/**
 * Check user's KYC status and display notification if needed
 * @param {string} kycStatus - User's KYC status
 */
function checkKycStatus(kycStatus) {
  const kycNotice = document.getElementById("kyc-notice");

  if (!kycNotice) {
    return;
  }

  if (kycStatus === "pending" || kycStatus === "rejected") {
    kycNotice.classList.remove("d-none");

    // Set the appropriate message
    const kycMessage = document.getElementById("kyc-message");
    if (kycMessage) {
      if (kycStatus === "pending") {
        kycMessage.textContent =
          "Your KYC verification is pending approval. Some features may be limited until verification is complete.";
      } else if (kycStatus === "rejected") {
        kycMessage.textContent =
          "Your KYC verification was rejected. Please update your information and submit again.";
      }
    }
  } else {
    kycNotice.classList.add("d-none");
  }
}

