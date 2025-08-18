const express = require('express');
const router = express.Router();
const {getAdminMessages, getUserMessages, getAssignedAdmin, getUsersForAdmin, sendMessageToUser} = require('../controllers/chatController');
const { protect, protectAdmin, authorizeAdmin } = require('../middlewares/AdminAuth');

// --- USER ROUTES ---
router.get('/me', protect, getAssignedAdmin);
router.get('/messages/:adminId', protect, getUserMessages);

// --- ADMIN ROUTES ---
router.get('/users', protectAdmin, getUsersForAdmin);
router.get('/messages/:userId', protectAdmin, authorizeAdmin, getAdminMessages);
router.post('/messages/:userId', protectAdmin, authorizeAdmin, sendMessageToUser);

module.exports = router;
