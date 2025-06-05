/**
 * @fileoverview Validation middleware for transaction operations
 */

const { body, param } = require("express-validator");

/**
 * Validation rules for deposit requests
 */
exports.depositValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.00000001 })
    .withMessage("Amount must be greater than 0"),

  body("walletAddress")
    .optional()
    .trim()
    .isLength({ min: 26, max: 100 })
    .withMessage("Invalid wallet address"),
];

/**
 * Validation rules for withdrawal requests
 */
exports.withdrawalValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.00000001 })
    .withMessage("Amount must be greater than 0"),

  body("walletAddress")
    .notEmpty()
    .withMessage("Wallet address is required")
    .trim()
    .isLength({ min: 26, max: 100 })
    .withMessage("Invalid wallet address"),

  body("currency")
    .notEmpty()
    .withMessage("Currency is required")
    .isString()
    .withMessage("Currency must be a string")
    .isLength({ min: 2, max: 10 })
    .withMessage("Invalid currency code"),
];

/**
 * Validation rules for saving wallet addresses
 */
exports.saveWalletAddressValidation = [
  body("address")
    .notEmpty()
    .withMessage("Wallet address is required")
    .trim()
    .isLength({ min: 26, max: 100 })
    .withMessage("Invalid wallet address"),

  body("currency")
    .notEmpty()
    .withMessage("Currency is required")
    .isString()
    .withMessage("Currency must be a string")
    .isLength({ min: 2, max: 10 })
    .withMessage("Invalid currency code"),

  body("network")
    .optional()
    .isString()
    .withMessage("Network must be a string")
    .isLength({ max: 20 })
    .withMessage("Network name too long"),

  body("label")
    .optional()
    .isString()
    .withMessage("Label must be a string")
    .isLength({ max: 50 })
    .withMessage("Label too long"),
];

/**
 * Validation rules for investment creation
 */
exports.investmentValidation = [
  body("planId")
    .notEmpty()
    .withMessage("Investment plan is required")
    .isMongoId()
    .withMessage("Invalid plan ID"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.00000001 })
    .withMessage("Amount must be greater than 0"),
];

/**
 * Validation rules for transaction processing
 */
exports.processTransactionValidation = [
  param("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isMongoId()
    .withMessage("Invalid transaction ID"),

  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["approve", "reject", "cancel"])
    .withMessage("Invalid action"),

  body("txHash")
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage("Invalid transaction hash"),
];

/**
 * Validation rules for manual deposits (admin only)
 */
exports.manualDepositValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.00000001 })
    .withMessage("Amount must be greater than 0"),

  body("walletAddress")
    .optional()
    .trim()
    .isLength({ min: 26, max: 100 })
    .withMessage("Invalid wallet address"),

  body("txHash")
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage("Invalid transaction hash"),
];
