const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signupUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protectUser } = require('../middlewares/auth');

// User Signup
router.post('/signup', signupUser); 

// User Login
router.post('/login', loginUser);

// Get user profile 
router.get('/profile', protectUser, getUserProfile);

// Update user profile
router.put('/profile', protectUser, updateUserProfile);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // hide password
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
