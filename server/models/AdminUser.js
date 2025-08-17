const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['MainAdmin', 'SalesAdmin', 'AgentAdmin'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);
