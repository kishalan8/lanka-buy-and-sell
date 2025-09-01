require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); // Adjust path if needed

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Users to seed
    const users = [
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
      },
    ];

    for (const userData of users) {
      const existingUser = await Admin.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`${userData.role} user already exists: ${userData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = new Admin({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      });

      await user.save();
      console.log(`${userData.role} user created: ${userData.email}`);
    }

    console.log('Seeding done');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedUsers();
