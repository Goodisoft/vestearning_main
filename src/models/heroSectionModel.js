const mongoose = require('mongoose');

const heroSectionSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
});

module.exports = mongoose.model('HeroSection', heroSectionSchema);
