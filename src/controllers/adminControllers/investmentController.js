/**
 * @fileoverview Controller for investment plan operations (admin)
 */

const planService = require("../../services/planService");
const currencyService = require("../../services/currencyService"); // Add currency service
const adminTransactionService = require("../../services/adminTransactionService"); // Add admin transaction service
const { validationResult } = require("express-validator");

class InvestmentController {
  static async activeInvestList(req, res) {
    try {
      // Get active investments with pagination and filtering
      const result = await adminTransactionService.getActiveInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId,
        planId: req.query.planId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      return res.render("adminViews/active_invest.ejs", {
        title: "Active Investments",
        investments: result.investments || [],
        pagination: result.pagination,
        filters: req.query,
      });
    } catch (error) {
      console.error("Error fetching active investments:", error);
      req.flash(
        "error",
        "An error occurred while fetching active investments."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  static async completedInvestList(req, res) {
    try {
      // Get completed investments with pagination and filtering
      const result = await adminTransactionService.getCompletedInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId,
        planId: req.query.planId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      return res.render("adminViews/completed_invest.ejs", {
        title: "Completed Investments",
        investments: result.investments || [],
        pagination: result.pagination,
        filters: req.query,
      });
    } catch (error) {
      console.error("Error fetching completed investments:", error);
      req.flash(
        "error",
        "An error occurred while fetching completed investments."
      );
      return res.redirect("/admin/dashboard");
    }
  }

  static async allInvestedList(req, res) {
    try {
      // Get all investments with pagination and filtering
      const result = await adminTransactionService.getAllInvestments({
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status,
        userId: req.query.userId,
        planId: req.query.planId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      });

      return res.render("adminViews/all_invest.ejs", {
        title: "All Investments",
        investments: result.investments || [],
        pagination: result.pagination,
        filters: req.query,
      });
    } catch (error) {
      console.error("Error fetching all investments:", error);
      req.flash("error", "An error occurred while fetching investments.");
      return res.redirect("/admin/dashboard");
    }
  }

  static async PlanSchemeList(req, res) {
    try {
      const result = await planService.getAllPlans();

      return res.render("adminViews/plan_scheme.ejs", {
        title: "Investment Plans",
        plans: result.plans || [],
        count: result.count || 0,
      });
    } catch (error) {
      console.error("Error fetching plans:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching investment plans.",
      });
    }
  }

  /**
   * Get all investment plans
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllPlans(req, res) {
    try {
      const result = await planService.getAllPlans(req.query);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // If it's an API request, return JSON
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(200).json(result);
      }

      // Otherwise render the admin view with plans data
      return res.render("adminViews/plan_scheme", {
        title: "Investment Plans",
        plans: result.plans,
        count: result.count,
      });
    } catch (error) {
      console.error("Error fetching plans:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching investment plans.",
      });
    }
  }

  /**
   * Create a new investment plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createPlan(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Format plan data from form
      const planData = {
        name: req.body.name,
        shortName: req.body.shortName,
        minAmount: parseFloat(req.body.minAmount),
        maxAmount: parseFloat(req.body.maxAmount),
        roiPercentage: parseFloat(req.body.roiPercentage),
        roiPeriod: req.body.roiPeriod,
        term: parseInt(req.body.term),
        termPeriod: req.body.termPeriod,
        type: req.body.type || "investment",
        isActive: req.body.isActive === "on" || req.body.isActive === true,
      };

      // Create the plan
      const result = await planService.createPlan(planData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating plan:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the investment plan.",
      });
    }
  }

  /**
   * Get a plan by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPlanById(req, res) {
    try {
      const result = await planService.getPlanById(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching plan:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the investment plan.",
      });
    }
  }

  /**
   * Update an investment plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updatePlan(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Format plan data from form
      const planData = {};
      if (req.body.name) planData.name = req.body.name;
      if (req.body.shortName) planData.shortName = req.body.shortName;
      if (req.body.minAmount)
        planData.minAmount = parseFloat(req.body.minAmount);
      if (req.body.maxAmount)
        planData.maxAmount = parseFloat(req.body.maxAmount);
      if (req.body.roiPercentage)
        planData.roiPercentage = parseFloat(req.body.roiPercentage);
      if (req.body.roiPeriod) planData.roiPeriod = req.body.roiPeriod;
      if (req.body.term) planData.term = parseInt(req.body.term);
      if (req.body.termPeriod) planData.termPeriod = req.body.termPeriod;
      if (req.body.type) planData.type = req.body.type;
      if (req.body.isActive !== undefined) {
        planData.isActive =
          req.body.isActive === "on" || req.body.isActive === true;
      }

      // Update the plan
      const result = await planService.updatePlan(req.params.id, planData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error updating plan:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the investment plan.",
      });
    }
  }

  /**
   * Toggle plan active status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async togglePlanStatus(req, res) {
    try {
      const result = await planService.togglePlanStatus(req.params.id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error toggling plan status:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while toggling the investment plan status.",
      });
    }
  }

  /**
   * Delete an investment plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deletePlan(req, res) {
    try {
      const result = await planService.deletePlan(req.params.id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting plan:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the investment plan.",
      });
    }
  }

  /**
   * Get plan statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPlanStatistics(req, res) {
    try {
      const result = await planService.getPlanStatistics();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching plan statistics:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching plan statistics.",
      });
    }
  }

  /* Currency Management Methods */

  /**
   * Display the currency management page
   * @param {*} req - The request object
   * @param {*} res - The response object
   */
  static async getCurrenciesPage(req, res) {
    try {
      const currencies = await currencyService.getAllCurrencies();

      res.render("adminViews/add_currency", {
        title: "Manage Currencies",
        currencies,
      });
    } catch (error) {
      req.flash("error", error.message || "Failed to fetch currencies");
      res.redirect("/admin/dashboard");
    }
  }

  /**
   * Create a new currency
   * @param {*} req - The request object
   * @param {*} res - The response object
   */
  static async createCurrency(req, res) {
    try {
      const { name, symbol, network, walletAddress } = req.body;
      const isActive = req.body.isActive === "on";

      // qrCode path is already set by the uploadMiddleware if a file was uploaded
      const currencyData = {
        name,
        symbol,
        network,
        walletAddress,
        qrCode: req.body.qrCode || null,
        isActive,
      };

      await currencyService.createCurrency(currencyData);

      return res.status(201).json({
        success: true,
        message: "Currency created successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to create currency",
      });
    }
  }

  /**
   * Get a specific currency by ID
   * @param {*} req - The request object
   * @param {*} res - The response object
   */
  static async getCurrency(req, res) {
    try {
      const { id } = req.params;
      const currency = await currencyService.getCurrencyById(id);

      return res.status(200).json({
        success: true,
        data: currency,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch currency",
      });
    }
  }

  /**
   * Update an existing currency
   * @param {*} req - The request object
   * @param {*} res - The response object
   */
  static async updateCurrency(req, res) {
    try {
      const { id } = req.params;
      const { name, symbol, network, walletAddress, currentQrPath } = req.body;
      const isActive = req.body.isActive === "on";

      // Prepare update data
      const updateData = {
        name,
        symbol,
        network,
        walletAddress,
        isActive,
      };

      // If a new file was uploaded, use the new path
      // Otherwise, keep the current path if it exists
      if (req.body.qrCode) {
        updateData.qrCode = req.body.qrCode;
      } else if (currentQrPath) {
        updateData.qrCode = currentQrPath;
      }

      await currencyService.updateCurrency(id, updateData);

      return res.status(200).json({
        success: true,
        message: "Currency updated successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update currency",
      });
    }
  }

  /**
   * Toggle the active status of a currency
   * @param {*} req - The request object
   * @param {*} res - The response object
   */
  static async toggleCurrencyStatus(req, res) {
    try {
      const { id } = req.params;

      await currencyService.toggleCurrencyStatus(id);

      return res.status(200).json({
        success: true,
        message: "Currency status updated successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update currency status",
      });
    }
  }

  /**
   * Delete a currency
   * @param {*} req - The request object
   * @param {*} res - The response object
   */
  static async deleteCurrency(req, res) {
    try {
      const { id } = req.params;

      // Delete currency and its QR code if exists
      await currencyService.deleteCurrencyWithQrCode(id);

      return res.status(200).json({
        success: true,
        message: "Currency deleted successfully",
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to delete currency",
      });
    }
  }
}

module.exports = InvestmentController;
