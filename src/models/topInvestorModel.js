
const mongoose = require('mongoose');
const topInvestorSchema = new mongoose.Schema({
    name: String,
    amount: Number,
  });
  
  module.exports = mongoose.model('TopInvestor', topInvestorSchema);
  