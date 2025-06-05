const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Investment
 * @property {ObjectId} userId - User who made the investment
 * @property {ObjectId} planId - Investment plan
 * @property {number} amount - Amount invested
 * @property {number} earningRate - Percentage per day (e.g. 0.05 for 5%)
 * @property {number} duration - Duration in days
 * @property {Date} startDate - When admin confirms investment
 * @property {Date} endDate - When investment completes
 * @property {string} status - active, completed, cancelled
 * @property {Date} completedAt - When investment finished
 * @property {Date} createdAt - When investment was created
 */

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    expectedEarning: {
      type: Number,
    },
    earningRate: {
      type: Number, // e.g. 0.05 for 5% daily
      required: true,
    },
    duration: {
      type: Number, // in days
      required: true,
    },
    durationUnit: {
      type: String,
      required: [true, "Duration unit is required"],
      enum: ["hour", "day", "week", "month"],
      default: "day",
    },
    type: {
      type: String,
      enum: ["investment", "promo", "loan"],
      required: [true, "Transaction type is required"], 
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Investment", investmentSchema);
