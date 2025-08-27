const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const colors = require('colors');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const jwt = require("jsonwebtoken");

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bikesRouter = require('./routes/bikes');
const submissionRoutes = require('./routes/submissions');
const sliderImages = require('./routes/sliderImages');
const usersRouter = require('./routes/users');

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
});


// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bikes', bikesRouter);
app.use('/api/submissions', submissionRoutes);
app.use('/api/slider-images', sliderImages);
app.use('/api/users', usersRouter); // Add this line to include user routes
//app.use('/api', require('./routes/sliderImagesRoute')); // Adjust path



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'.green))
  .catch((err) => console.error('MongoDB connection error:'.red, err));

// --- Start server ---
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.blue.bold);
  console.log(`📡 Socket.IO enabled for real-time chat`.cyan);
});
