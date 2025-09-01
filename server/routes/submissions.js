const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
  getUserSubmissions,
} = require('../controllers/submissionController');
const { protectUser, protect} = require('../middlewares/auth');
const uploadBikeFiles = require('../middlewares/upload');

// User route
router.post('/', protectUser, uploadBikeFiles, createSubmission);
router.get('/my', protectUser, getUserSubmissions);

// Admin routes
router.get('/', protect, getSubmissions);
router.put('/:id/approve', protect, approveSubmission);
router.put('/:id/reject', protect, rejectSubmission);
router.delete('/:id', protect, deleteSubmission);

module.exports = router;
