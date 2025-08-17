const express = require('express');
const router = express.Router();
const { protect, protectAdmin, authorizeAdmin } = require('../middlewares/AdminAuth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  applyForJob,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  submitAgentApplication
} = require('../controllers/applicationController');

router.post('/:jobId', protect, upload.single('cv'), applyForJob);
router.get('/', protect, getMyApplications);
router.get('/all', getAllApplications); // Admin
router.put('/:jobId/:applicantId', updateApplicationStatus); // Admin

// Agent
router.post('/agent/applications', protect, upload.single('cv'), submitAgentApplication);

module.exports = router;