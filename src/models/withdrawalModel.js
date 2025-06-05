/**
 * @fileoverview Withdrawal model for handling user withdrawal requests
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Withdrawal
 * @property {ObjectId} userId - User who made the withdrawal
 * @property {string} type - Type of withdrawal (wallet or referral)
 * @property {number} amount - Withdrawal amount
 * @property {string} currency - Currency being withdrawn
 * @property {string} status - Status of withdrawal (pending, completed, failed, cancelled)
 * @property {string} walletAddress - Destination wallet address
 * @property {string} txHash - Transaction hash (for completed withdrawals)
 * @property {string} reason - Reason for rejection/cancellation
 * @property {Date} createdAt - When the withdrawal was created
 * @property {Date} updatedAt - When the withdrawal was last updated
 * @property {Date} completedAt - When the withdrawal was completed
 */

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["wallet", "referral"],
      required: [true, "Withdrawal type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "USDT",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      trim: true,
    },
    txHash: {
      type: String,
      trim: true,
      sparse: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for performance
withdrawalSchema.index({ createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
