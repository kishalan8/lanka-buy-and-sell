// routes/admin.js or routes/submissions.js

const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission'); // Your Mongoose model

// Get all submissions
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Delete a submission
router.delete('/submissions/:id', async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

module.exports = router;
