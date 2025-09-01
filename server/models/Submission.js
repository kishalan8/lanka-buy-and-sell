// models/BikeSubmission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  model: { type: String },
  year: { type: Number },
  price: { type: Number },
  mileage: { type: Number },
  engineCapacity: { type: Number },
  brand: { type: String, enum: ['Yamaha', 'Suzuki', 'KTM', 'Bajaj', 'HeroHonda', 'Honda'] },
  condition: { type: String, enum: ['new', 'used'], required: true },
  images: [{ type: String }],
  description: { type: String },
  ownerName: { type: String },
  ownerContact: { type: Number },
  documents: [
    {
      type: {
        type: String,
        enum: ['Bike Book', 'Revenue License', 'Insurance', 'Emmision Test'],
        required: true,
      },
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Normal user submitting
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', SubmissionSchema);
