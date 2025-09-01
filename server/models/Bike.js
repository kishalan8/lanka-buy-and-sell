const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  bikeID: { type: String, unique: true, required: true }, // UUID
  model: { type: String,  },
  year: { type: Number,  },
  price: { type: Number, },
  stock: { type: Number, default: 0 },
  mileage: { type: Number },
  engineCapacity: { type: Number },
  brand: { type: String, enum: ['Yamaha', 'Suzuki', 'KTM', 'Bajaj', 'HeroHonda', 'Honda']},
  condition: { type: String, enum: ['new', 'used'], required: true },
  images: [{ type: String }],
  description: { type: String },
  createdby: { type: mongoose.Schema.Types.ObjectId, 
               ref: 'Admin'
            },
  ownerName: { type: String },
  ownerContact: { type: Number },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
  documents: [ // Documents per managed candidate
       {
          type: {
          type: String,
          enum: ['Bike Book', 'Revenue License', 'Insurance', 'Emmision Test'],
          required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }
]
});

module.exports = mongoose.model('Bike', bikeSchema);
