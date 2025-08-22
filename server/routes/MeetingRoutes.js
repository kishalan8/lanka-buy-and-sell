const express = require('express');
const router = express.Router();
const {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
} = require('../controllers/meetingController');
const { protect, protectAdmin, authorizeAdmin } = require('../middlewares/AdminAuth');

// Get all meetings (private)
router.get('/', protectAdmin, authorizeAdmin("MainAdmin","SalesAdmin","AgentAdmin"), getMeetings);

// Get single meeting
router.get('/:id', protectAdmin, authorizeAdmin("MainAdmin","SalesAdmin","AgentAdmin"), getMeeting);

// Create a meeting (admin)
router.post('/', protectAdmin, authorizeAdmin("MainAdmin","SalesAdmin","AgentAdmin"), createMeeting);

// Update a meeting (admin)
router.put('/:id', protectAdmin, authorizeAdmin("MainAdmin","SalesAdmin","AgentAdmin"), updateMeeting);

// Delete a meeting (admin)
router.delete('/:id', protectAdmin, authorizeAdmin("MainAdmin","SalesAdmin","AgentAdmin"), deleteMeeting);

module.exports = router;
