const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  bikeID: { type: String, unique: true, required: true }, // UUID
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  brand: { type: String, enum: ['Yamaha', 'Suzuki', 'KTM', 'Bajaj', 'HeroHonda', 'Honda']},
  condition: { type: String, enum: ['new', 'used'], required: true },
  images: [{ type: String }], // support multiple images
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bike', bikeSchema);
