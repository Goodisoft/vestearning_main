// models/wallet.model.js
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true,    
    index: true     
  },
  totalDeposit: { 
    type: Number, 
    default: 0 
  },
  totalWithdrawal: { 
    type: Number, 
    default: 0 
  },
  walletBalance: { 
    type: Number, 
    default: 0 
  },
  referralBalance: { 
    type: Number, 
    default: 0 
  },
  withdrawalAddresses: [
    {
      currency: { type: String}, 
      address: { type: String },
      network: { type: String }, 
      label: { type: String }, 
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Wallet', WalletSchema);
