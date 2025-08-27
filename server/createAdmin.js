const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const hashed = await bcrypt.hash('admin123', 10);
  const admin = new User({
    name: 'Admin',
    email: 'admin@lanka.com',
    password: hashed,
    role: 'admin'
  });
  await admin.save();
  console.log('✅ Admin user created');
  process.exit();
}).catch(err => console.error('MongoDB connection error:', err));
