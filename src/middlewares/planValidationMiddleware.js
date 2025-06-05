/**
 * @fileoverview Validation middleware for investment plan operations
 */

const { body } = require("express-validator");

/**
 * Validation rules for creating/updating investment plans
 */
exports.planValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Plan name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Plan name must be between 3 and 50 characters"),

  body("minAmount")
    .notEmpty()
    .withMessage("Minimum amount is required")
    .isNumeric()
    .withMessage("Minimum amount must be a number")
    .isFloat({ min: 0 })
    .withMessage("Minimum amount cannot be negative"),

  body("maxAmount")
    .notEmpty()
    .withMessage("Maximum amount is required")
    .isNumeric()
    .withMessage("Maximum amount must be a number")
    .isFloat({ min: 0 })
    .withMessage("Maximum amount cannot be negative")
    .custom((value, { req }) => {
      const minAmount = parseFloat(req.body.minAmount);
      const maxAmount = parseFloat(value);
      if (maxAmount < minAmount) {
        throw new Error("Maximum amount must be greater than minimum amount");
      }
      return true;
    }),

  body("roiPercentage")
    .notEmpty()
    .withMessage("ROI percentage is required")
    .isNumeric()
    .withMessage("ROI percentage must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("ROI percentage must be between 0 and 100"),

  body("roiPeriod")
    .notEmpty()
    .withMessage("ROI period is required")
    .isIn(["hourly", "daily", "weekly", "monthly"])
    .withMessage("ROI period must be daily, weekly, or monthly"),

  body("term")
    .notEmpty()
    .withMessage("Term is required")
    .isInt({ min: 1 })
    .withMessage("Term must be at least 1"),

  body("type")
    .notEmpty()
    .withMessage("Plan type is required")
    .isIn(["investment", "loan", "promo", "trading"])
    .withMessage("Plan type must be investment, loan, promo, or trading"),
];
