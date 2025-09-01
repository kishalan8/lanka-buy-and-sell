const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// REGISTER ADMIN USER
exports.registerAdmin = async (req, res) => {
  const { name, email, password} = req.body;

  try {
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new AdminUser({ name, email, password: hashedPassword});
    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN ADMIN USER
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request body:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  try {
    // Find user by email and role
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'User not found with this email and role' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL ADMINS
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE ADMIN
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin updated successfully", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE ADMIN
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};