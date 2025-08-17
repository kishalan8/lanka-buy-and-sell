const express = require('express');
const router = express.Router();
const { protect, protectAdmin, authorizeAdmin } = require('../middlewares/AdminAuth');
const upload = require('../middlewares/upload');

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getManagedCandidates,
  addManagedCandidate,
  updateManagedCandidate,
  deleteManagedCandidate,
  createInquiry,
  getInquiries,
  getAgentApplications,
  getUserProfile,
  updateUserProfile,
  loginUser,
  signupUser,
  getUserApplications
} = require('../controllers/usersController');

const {
  uploadUserDocuments,
  getUserDocuments,
  deleteDocument,
  getDocumentsByType,
} = require('../controllers/documentController');

// --------------------
// Auth & Profile Routes
// --------------------
router.post('/login', loginUser);

router.post(
  '/signup',
  upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'CV', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
  ]),
  signupUser
);

router.get('/profile', protect, getUserProfile);

router.put(
  '/profile',
  protect,
  upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'CV', maxCount: 5 },
  ]),
  updateUserProfile
);

// --------------------
// Document Routes
// --------------------
router.get('/documents', protect, getUserDocuments);
router.get('/documents/:type', protect, getDocumentsByType);
router.post(
  '/documents',
  protect,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 5 },
    { name: 'passport', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
  ]),
  uploadUserDocuments
);
router.delete('/documents/:id', protect, deleteDocument);

// --------------------
// Agent Routes
// --------------------
router.get('/agent/candidates', protect, getManagedCandidates);
router.post('/agent/candidates', protect, upload.single('cv'), addManagedCandidate);
router.put('/agent/candidates/:id', protect, upload.single('cv'), updateManagedCandidate);
router.delete('/agent/candidates/:id', protect, deleteManagedCandidate);

router.post('/agent/inquiries', protect, createInquiry);
router.get('/agent/inquiries', protect, getInquiries);

router.get('/agent/applications', protect, getAgentApplications);

// Optional legacy document routes for agents
router.post('/agent/documents', protect, upload.single('file'), uploadUserDocuments);
router.get('/agent/documents', protect, getUserDocuments);
router.delete('/agent/documents/:id', protect, deleteDocument);

// --------------------
// User Management (Admin Only)
// --------------------
router.get("/", protectAdmin, authorizeAdmin("MainAdmin","SalesAdmin","AgentAdmin"), getUsers);

// Specific routes should come before parameterized ones
router.get('/applications', protect, getUserApplications);

router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;
