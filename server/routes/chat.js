const express = require('express');
const router = express.Router();
const {getAdminMessages, getUserMessages, getAssignedAdmin, getUsersForAdmin, sendMessageToUser, sendMessageToAdmin} = require('../controllers/chatController');
const { protectUser, protect } = require('../middlewares/auth');

// --- USER ROUTES ---
router.get('/me', protectUser, getAssignedAdmin);
router.get('/messages/:adminId', protectUser, getUserMessages);
router.post('/messages/:adminId', protectUser, sendMessageToAdmin);

// --- ADMIN ROUTES ---
router.get('/users', protect, getUsersForAdmin);
router.get('/admin/:userId', protect, getAdminMessages);
router.post('/admin/:userId', protect, sendMessageToUser);

module.exports = router;
