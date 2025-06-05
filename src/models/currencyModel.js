const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Currency
 * @property {string} name - Name of the currency
 * @property {string} symbol - Symbol of the currency
 * @property {string} network - Network of the currency (e.g., BEP20, ERC20)
 * @property {string} walletAddress - Wallet address for the currency
 * @property {string} qrCode - QR code for the currency
 * @property {boolean} isActive - Whether the currency is active
 * @property {Date} createdAt - When the currency was created
 * @property {Date} updatedAt - When the currency was last updated
 */

const currencySchema = new Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  network: { type: String },
  walletAddress: { type: String, required: true },
  qrCode: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Currency", currencySchema);
