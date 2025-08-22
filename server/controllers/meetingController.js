const asyncHandler = require('express-async-handler');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private (admin)
const getMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find()
    .populate('createdBy', 'name role email')
    .populate('participants.refId', 'name role userType email'); // populate participants dynamically
  res.json(meetings);
});

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private (admin)
const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('createdBy', 'name role email')
    .populate('participants.refId', 'name role userType email');

  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }

  res.json(meeting);
});

// @desc    Create a meeting
// @route   POST /api/meetings
// @access  Private (admin)
const createMeeting = asyncHandler(async (req, res) => {
  const { title, date, time, duration, location, meetingLink, type, status, notes, participants } = req.body;

  const populatedParticipants = await Promise.all(
    (participants || []).map(async (p) => {
      let userDoc;
      if (p.userType === 'AdminUser') {
        userDoc = await AdminUser.findById(p.refId);
      } else {
        userDoc = await User.findById(p.refId);
      }

      return {
        userType: p.userType,
        refId: p.refId,
        name: userDoc?.name || p.name || 'Unknown',
        email: userDoc?.email || p.email || 'Unknown', // include email
      };
    })
  );

  const meeting = await Meeting.create({
    title,
    date,
    time,
    duration,
    location,
    meetingLink,
    type,
    status,
    notes,
    participants: populatedParticipants,
    createdBy: req.admin._id,
  });

  res.status(201).json(meeting);
});

// @desc    Update a meeting
// @route   PUT /api/meetings/:id
// @access  Private (admin)
const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }

  // Update participants if provided
  if (req.body.participants) {
    const populatedParticipants = await Promise.all(
      req.body.participants.map(async (p) => {
        let userDoc;
        if (p.userType === 'AdminUser') {
          userDoc = await AdminUser.findById(p.refId);
        } else {
          userDoc = await User.findById(p.refId);
        }

        return {
          userType: p.userType,
          refId: p.refId,
          name: userDoc?.name || p.name ||'Unknown',
          email: userDoc?.email || p.email || 'Unknown', // include email
        };
      })
    );
    req.body.participants = populatedParticipants;
  }

  Object.assign(meeting, req.body);
  const updatedMeeting = await meeting.save();
  res.json(updatedMeeting);
});

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private (admin)
const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }

  await meeting.remove();
  res.json({ message: 'Meeting removed' });
});

module.exports = {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};
