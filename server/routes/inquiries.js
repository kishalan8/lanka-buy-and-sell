const express = require('express');
const router = express.Router();
const { getAllInquiries, updateInquiryStatus } = require('../controllers/inquiryController');

// Get all inquiries
router.get('/', getAllInquiries);

// Update inquiry status
router.put('/:jobId/:inquiryId', updateInquiryStatus);

module.exports = router;
