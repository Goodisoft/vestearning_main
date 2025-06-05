/**
 * @fileoverview Service for currency-related operations
 */

const currencyRepository = require("../repositories/currencyRepository");
const { AppError } = require("../utils/errorHandler");
const fs = require("fs");
const path = require("path");

class CurrencyService {
  /**
   * Create a new currency
   * @param {Object} currencyData - The currency data
   * @returns {Promise<Object>} Created currency
   */
  async createCurrency(currencyData) {
    try {
      // Validate currency data
      if (!currencyData.name || !currencyData.symbol) {
        throw new AppError("Name and symbol are required", 400);
      }

      // Convert symbol to uppercase
      currencyData.symbol = currencyData.symbol.toUpperCase();

      // Validate network if provided
      if (currencyData.network && typeof currencyData.network !== "string") {
        throw new AppError("Network must be a string", 400);
      }

      // Create currency in the database
      return await currencyRepository.create(currencyData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all currencies
   * @returns {Promise<Array>} List of all currencies
   */
  async getAllCurrencies() {
    try {
      return await currencyRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active currencies
   * @returns {Promise<Array>} List of active currencies
   */
  async getActiveCurrencies() {
    try {
      return await currencyRepository.findActiveCurrencies();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a currency by ID
   * @param {string} id - The currency ID
   * @returns {Promise<Object>} Currency details
   */
  async getCurrencyById(id) {
    try {
      if (!id) {
        throw new AppError("Currency ID is required", 400);
      }
      return await currencyRepository.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a currency by symbol
   * @param {string} symbol - The currency symbol
   * @returns {Promise<Object>} Currency details
   */
  async getCurrencyBySymbol(symbol) {
    try {
      if (!symbol) {
        throw new AppError("Currency symbol is required", 400);
      }
      return await currencyRepository.findBySymbol(symbol);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a currency
   * @param {string} id - The currency ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated currency
   */
  async updateCurrency(id, updateData) {
    try {
      if (!id) {
        throw new AppError("Currency ID is required", 400);
      }

      if (!updateData.name || !updateData.symbol) {
        throw new AppError("Name and symbol are required", 400);
      }

      // Convert symbol to uppercase
      if (updateData.symbol) {
        updateData.symbol = updateData.symbol.toUpperCase();
      }

      // Validate network if provided
      if (updateData.network && typeof updateData.network !== "string") {
        throw new AppError("Network must be a string", 400);
      }

      return await currencyRepository.update(id, updateData);
    } catch (error) {
      console.log("");
      
      throw error;
    }
  }

  /**
   * Toggle currency active status
   * @param {string} id - The currency ID
   * @returns {Promise<Object>} Updated currency
   */
  async toggleCurrencyStatus(id) {
    try {
      if (!id) {
        throw new AppError("Currency ID is required", 400);
      }
      return await currencyRepository.toggleStatus(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a currency
   * @param {string} id - The currency ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCurrency(id) {
    try {
      if (!id) {
        throw new AppError("Currency ID is required", 400);
      }
      return await currencyRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a currency and its QR code file if exists
   * @param {string} id - The currency ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCurrencyWithQrCode(id) {
    try {
      if (!id) {
        throw new AppError("Currency ID is required", 400);
      }

      // First get the currency to check if it has a QR code
      const currency = await this.getCurrencyById(id);

      if (!currency) {
        throw new AppError("Currency not found", 404);
      }

      // If the currency has a QR code, delete the file
      if (currency.qrCode) {
        try {
          // Get the file path - the qrCode field contains path like /uploads/qrcodes/filename.jpg
          // We need to convert to absolute path in the public directory
          const qrCodePath = path.join(
            process.cwd(),
            "public",
            currency.qrCode
          );

          // Check if file exists before deleting
          if (fs.existsSync(qrCodePath)) {
            fs.unlinkSync(qrCodePath);
            // console.log(`Deleted QR code file: ${qrCodePath}`);
          }
        } catch (fileError) {
          // console.error(`Error deleting QR code file: ${fileError.message}`);
          // Continue with currency deletion even if file deletion fails
        }
      }

      // Now delete the currency from database
      return await currencyRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get currency statistics
   * @returns {Promise<Object>} Currency statistics
   */
  async getCurrencyStatistics() {
    try {
      return await currencyRepository.getStatistics();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CurrencyService();
