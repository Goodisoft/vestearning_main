const mongoose = require("mongoose");
const whyChooseUsSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WhyChooseUs", whyChooseUsSchema);
