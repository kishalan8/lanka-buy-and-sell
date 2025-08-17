require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/joblistings', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`.red.bold);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
