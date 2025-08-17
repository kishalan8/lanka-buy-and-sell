const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Document Collection',
      'Job Placement',
      'Communication',
      'Partnership Management',
      'Business Development',
      'Visa Processing',
      'Financial',
      'Administrative',
      'Training',
      'Assessment'
    ]
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  assignedToAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser', // Admin
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Candidate or Agent
    required: true
  },
  clientType: {
    type: String,
    enum: ['candidate', 'agent'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
  type: String,
  enum: ["Pending", "In Progress", "Completed"],
  default: "Pending",
},

}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
