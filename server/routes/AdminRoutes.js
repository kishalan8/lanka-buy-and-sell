const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAllAdmins,updateAdmin, deleteAdmin } = require('../controllers/AdminAuthController');
const { protectAdmin, authorizeAdmin } = require('../middlewares/AdminAuth');

// LOGIN (public)
router.post('/login', loginAdmin);

// REGISTER (only admin can create)
router.post('/register', protectAdmin, authorizeAdmin('MainAdmin'), registerAdmin);

// PROTECTED ROUTES
router.get('/admin-dashboard', protectAdmin, authorizeAdmin('MainAdmin'), (req, res) => {
  res.json({ message: 'Admin Dashboard' });
});

router.get('/sales-dashboard', protectAdmin, authorizeAdmin('MainAdmin', 'SalesAdmin'), (req, res) => {
  res.json({ message: 'Sales Dashboard' });
});

router.get('/agent-dashboard', protectAdmin, authorizeAdmin('MainAdmin', 'AgentAdmin'), (req, res) => {
  res.json({ message: 'Agent Dashboard' });
});

// Get all admins
router.get("/", protectAdmin, authorizeAdmin("MainAdmin"), getAllAdmins);

// Update admin
router.put("/:id", protectAdmin, authorizeAdmin("MainAdmin"), updateAdmin);

// Delete admin
router.delete("/:id", protectAdmin, authorizeAdmin("MainAdmin"), deleteAdmin);

module.exports = router;
