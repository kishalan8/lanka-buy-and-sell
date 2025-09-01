// server.js
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

const User = require('./models/User');
const AdminUser = require('./models/Admin');
const Message = require('./models/Message');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bikesRouter = require('./routes/bikes');
const submissionRoutes = require('./routes/submissions');
const sliderImages = require('./routes/sliderImages');
const usersRouter = require('./routes/users');

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(cors({ origin: (_origin, callback) => callback(null, true), credentials: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
});

// --- JWT middleware for Socket.IO ---
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized: Token missing'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, name, role }
    next();
  } catch (err) {
    console.log('Socket auth error:', err.message);
    next(new Error('Unauthorized: Invalid token'));
  }
});

// --- Socket.IO connection ---
io.on('connection', (socket) => {
  const userId = socket.user.id;
  const role = socket.user.role;
  console.log('📡 Client connected:', socket.id, 'User:', userId, 'Role:', role);

  // Auto-join room
  socket.join(userId);

  // Send message
  socket.on('sendMessage', async ({ content, recipientId }) => {
    if (!content || !recipientId) return socket.emit('messageError', { error: 'Missing fields' });

    try {
      let senderName = '';
      let recipientName = '';
      let senderType = role === 'admin' ? 'admin' : 'user';
      let recipientType = senderType === 'admin' ? 'user' : 'admin';
      let senderModel = senderType === 'admin' ? 'AdminUser' : 'User';
      let recipientModel = recipientType === 'admin' ? 'AdminUser' : 'User';

      // Get sender
      let sender;
      if (senderType === 'admin') sender = await AdminUser.findById(userId);
      else sender = await User.findById(userId);
      if (!sender) return socket.emit('messageError', { error: 'Sender not found' });
      senderName = sender.name;

      // Get recipient
      let recipient;
      if (recipientType === 'admin') recipient = await AdminUser.findById(recipientId);
      else recipient = await User.findById(recipientId);
      if (!recipient) return socket.emit('messageError', { error: 'Recipient not found' });
      recipientName = recipient.name;

      // Create message
      const newMessage = await Message.create({
        content,
        senderId: userId,
        senderType,
        senderName,
        senderModel,
        recipientId,
        recipientType,
        recipientName,
        recipientModel
      });

      // Emit to recipient room and back to sender
      io.to(recipientId.toString()).emit('receiveMessage', newMessage);
      socket.emit('messageSent', newMessage);

    } catch (err) {
      console.error('❌ sendMessage error:', err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ recipientId }) => {
    if (recipientId) io.to(recipientId.toString()).emit('typing', { from: userId });
  });
  socket.on('stopTyping', ({ recipientId }) => {
    if (recipientId) io.to(recipientId.toString()).emit('stopTyping', { from: userId });
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bikes', bikesRouter);
app.use('/api/submissions', submissionRoutes);
app.use('/api/slider-images', sliderImages);
app.use('/api/users', usersRouter);
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/chats', require('./routes/chat'));

// --- Connect MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'.green))
  .catch((err) => console.error('MongoDB connection error:'.red, err));

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.blue.bold);
  console.log(`📡 Socket.IO enabled for real-time chat`.cyan);
});

