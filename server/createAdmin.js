const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/lankabuyandsell', {
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
