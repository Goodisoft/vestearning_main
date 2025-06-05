/**
 * @fileoverview Currency controller for handling currency-related operations
 */

const currencyService = require("../services/currencyService");

/**
 * Get all active currencies for investment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with currencies
 */
exports.getActiveCurrencies = async (req, res) => {
  try {
    // Get all active currencies
    const currencies = await currencyService.getAllCurrencies({
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      currencies: currencies || [],
    });
  } catch (error) {
    console.error("Error fetching active currencies:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching currencies.",
    });
  }
};

/**
 * Get specific currency by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with currency details
 */
exports.getCurrencyById = async (req, res) => {
    
  try {
    const { id } = req.params;

    const currency = await currencyService.getCurrencyById(id);

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    if (!currency.isActive) {
      return res.status(400).json({
        success: false,
        message: "This payment method is not available",
      });
    }

    return res.status(200).json({
      success: true,
      currency: currency,
    });
  } catch (error) {
    console.error("Error fetching currency details:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching currency details.",
    });
  }
};
