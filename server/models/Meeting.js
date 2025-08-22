const mongoose = require('mongoose');

// Participant subdocument schema
const participantSchema = new mongoose.Schema({
  userType: {
    type: String, 
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType' // points to userType in this subdocument
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

// Meeting schema
const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  location: { type: String },
  meetingLink: { type: String },
  type: {
    type: String,
    enum: ['Candidate Interview', 'Agent Meeting', 'Internal Meeting'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Canceled'],
    default: 'Scheduled'
  },
  notes: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser', // the creator is always an admin
    required: true
  },
  participants: [participantSchema] // array of participants
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
