const mongoose = require('mongoose');

const sliderImageSchema = new mongoose.Schema({
  imageUrl: String,
  caption: String
});

module.exports = mongoose.model('SliderImage', sliderImageSchema);
