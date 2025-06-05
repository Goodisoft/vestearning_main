/**
 * @fileoverview Transaction model for deposit, withdrawal, and investment transactions
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Transaction
 * @property {ObjectId} userId - User who made the transaction
 * @property {string} type - Type of transaction (deposit, withdrawal, investment, earnings, referral)
 * @property {number} amount - Transaction amount in smallest unit (satoshi/wei)
 * @property {string} currency - Transaction currency (BTC, ETH, etc.)
 * @property {string} status - Transaction status (pending, completed, failed, cancelled)
 * @property {string} txHash - Transaction hash on the blockchain (for deposits/withdrawals)
 * @property {ObjectId} planId - Investment plan ID (for investments)
 * @property {ObjectId} referralId - Referral ID (for referral earnings)
 * @property {string} walletAddress - Wallet address (for deposits/withdrawals)
 * @property {string} description - Transaction description
 * @property {Date} completedAt - When the transaction was completed
 * @property {Date} createdAt - When the transaction was created
 * @property {Date} updatedAt - When the transaction was last updated
 */

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    type: {
      type: String,
      enum: ["investment", "withdrawal", "promo", "loan", "referral", "trading", "bonus", "charge"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    expectedEarning: {
      type: Number,
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
    },
    txHash: {
      type: String,
      trim: true,
      sparse: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      sparse: true,
    },
    referralId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for performance
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
