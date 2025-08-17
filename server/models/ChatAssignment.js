const mongoose = require('mongoose');

const chatAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  userType: {
    type: String,
    enum: ['candidate', 'agent'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'transferred'],
    default: 'active'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure unique assignment per user
chatAssignmentSchema.index({ userId: 1 }, { unique: true });
chatAssignmentSchema.index({ adminId: 1 });
chatAssignmentSchema.index({ userType: 1 });

module.exports = mongoose.model('ChatAssignment', chatAssignmentSchema);