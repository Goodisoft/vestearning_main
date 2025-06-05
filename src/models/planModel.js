/**
 * @fileoverview Investment Plan model
 */

const mongoose = require("mongoose");

/**
 * @typedef {Object} InvestmentPlan
 * @property {string} name - Name of the investment plan
 * @property {string} shortName - Short name for the plan
 * @property {number} minAmount - Minimum investment amount (USD)
 * @property {number} maxAmount - Maximum investment amount (USD)
 * @property {number} roiPercentage - Return on investment percentage
 * @property {string} roiPeriod - Period for ROI calculation (hourly, daily, weekly, monthly)
 * @property {number} term - Duration of the investment plan
 * @property {string} termPeriod - Period for the investment term (hourly, daily, weekly, monthly)
 * @property {string} type - Type of investment plan
 * @property {boolean} isActive - Whether the plan is active
 * @property {Date} createdAt - When the plan was created
 * @property {Date} updatedAt - When the plan was last updated
 */

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      trim: true,
      uppercase: true,
    },
    minAmount: {
      type: Number,
      required: [true, "Minimum amount is required"],
      min: [0, "Minimum amount cannot be negative"],
    },
    maxAmount: {
      type: Number,
      required: [true, "Maximum amount is required"],
      validate: {
        validator: function (value) {
          return value >= this.minAmount;
        },
        message:
          "Maximum amount must be greater than or equal to minimum amount",
      },
    },
    roiPercentage: {
      type: Number,
      required: [true, "ROI percentage is required"],
      min: [0, "ROI percentage cannot be negative"],
    },
    roiPeriod: {
      type: String,
      required: [true, "ROI period is required"],
      enum: ["hourly", "daily", "weekly", "monthly"],
      default: "daily",
    },
    term: {
      type: Number,
      required: [true, "Term days is required"],
      min: [1, "Term days must be at least 1"],
    },
    termPeriod: {
      type: String,
      required: [true, "ROI period is required"],
      enum: ["hour", "day", "week", "month"],
      default: "day",
    },

    type: {
      type: String,
      required: [true, "Plan type is required"],
      enum: ["investment", "loan", "promo", "trading"],
      default: "investment",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for performance
planSchema.index({ isActive: 1 });
planSchema.index({ type: 1 });

module.exports = mongoose.model("Plan", planSchema);
