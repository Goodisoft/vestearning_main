/**
 * @fileoverview Currency routes for user-facing API endpoints
 */

const express = require("express");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");
const currencyController = require("../../controllers/currencyController");

const router = express.Router();

router.use(protect, restrictTo("user"));

/**
 * @route GET /api/currencies/active
 * @desc Get all active currencies for investment
 * @access Private
 */
router.get("/active", protect, currencyController.getActiveCurrencies);

/**
 * @route GET /api/currencies/:id
 * @desc Get specific currency by ID
 * @access Private
 */
router.get("/:id", protect, currencyController.getCurrencyById);

module.exports = router;
