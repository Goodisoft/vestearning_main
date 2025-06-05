/**
 * @fileoverview Repository for currency-related database operations
 */

const BaseRepository = require("./baseRepository");
const CurrencyModel = require("../models/currencyModel");
const { AppError } = require("../utils/errorHandler");

class CurrencyRepository extends BaseRepository {
  constructor() {
    super(CurrencyModel);
  }

  /**
   * Find a currency by its symbol
   * @param {string} symbol - The currency symbol to search for
   * @returns {Promise<Object|null>} - The currency or null if not found
   */
  async findBySymbol(symbol) {
    try {
      const upperSymbol = symbol.toUpperCase();
      const currency = await this.model.findOne({ symbol: upperSymbol });
      return currency;
    } catch (error) {
      throw new AppError(
        `Error finding currency by symbol: ${error.message}`,
        500
      );
    }
  }

  /**
   * Find all active currencies
   * @returns {Promise<Array>} - List of active currencies
   */
  async findActiveCurrencies() {
    try {
      return await this.model.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      throw new AppError(
        `Error finding active currencies: ${error.message}`,
        500
      );
    }
  }

  /**
   * Toggle the active status of a currency
   * @param {string} id - The currency ID
   * @returns {Promise<Object>} - The updated currency
   */
  async toggleStatus(id) {
    try {
      const currency = await this.findById(id);
      if (!currency) {
        throw new AppError("Currency not found", 404);
      }

      currency.isActive = !currency.isActive;
      return await currency.save();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Error toggling currency status: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get currency statistics
   * @returns {Promise<Object>} - Statistics about currencies
   */
  async getStatistics() {
    try {
      const totalCount = await this.model.countDocuments();
      const activeCount = await this.model.countDocuments({ isActive: true });
      const inactiveCount = await this.model.countDocuments({
        isActive: false,
      });

      return {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
      };
    } catch (error) {
      throw new AppError(
        `Error getting currency statistics: ${error.message}`,
        500
      );
    }
  }
}

module.exports = new CurrencyRepository();
