const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  price: Number,
  condition: String,
  description: String,
  sellerName: String,
  sellerPhone: String,
  sellerEmail: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
