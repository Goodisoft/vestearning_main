
const mongoose = require("mongoose");

const aboutSectionSchema = new mongoose.Schema({
    title: String,
    description: String,
});
  
module.exports = mongoose.model('AboutSection', aboutSectionSchema);
  