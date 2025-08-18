// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const colors = require('colors');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const Message = require('./models/Message');
const User = require('./models/User');
const AdminUser = require('./models/AdminUser');
const ChatUser = require('./models/ChatUser')
const ChatAssignment = require('./models/ChatAssignment')

dotenv.config();
const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(cors({ origin: (_origin, callback) => callback(null, true), credentials: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'.green))
  .catch((err) => console.error('MongoDB connection error:'.red, err));

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);

  socket.on('joinRoom', ({ userId, role }) => {
    socket.join(userId);
    console.log(`✅ ${role} joined room ${userId}`);
  });

  socket.on('sendMessage', async ({ content, senderId, senderType }) => {
    if (!content || !senderId || !senderType) {
      return socket.emit('messageError', { error: 'Missing required fields' });
    }

    try {
      let finalRecipientId, senderName, senderModel, recipientName, recipientModel;

      if (senderType === 'user') {
        // Auto-assign first admin
        const admin = await AdminUser.findOne();
        if (!admin) return socket.emit('messageError', { error: 'No admin available' });

        finalRecipientId = admin._id;
        senderModel = 'User';
        recipientModel = 'AdminUser';
        senderName = (await User.findById(senderId))?.name || 'User';
        recipientName = admin.name;
      } else if (senderType === 'admin') {
        return socket.emit('messageError', { error: 'Admin recipientId required' });
      }

      const newMessage = await Message.create({
        content,
        senderId,
        senderType,
        recipientId: finalRecipientId,
        recipientType: 'admin',
        senderModel,
        recipientModel,
        senderName,
        recipientName,
      });

      io.to(finalRecipientId.toString()).emit('receiveMessage', newMessage);
      socket.emit('messageSent', newMessage);

    } catch (err) {
      console.error('❌ sendMessage error:', err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// --- API Routes ---
app.use('/api/admins', require('./routes/AdminRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/TaskRoutes'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));  
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/chats', require('./routes/chat'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api', require('./routes/documents'));

// --- Serve frontend in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../front/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../front/dist', 'index.html'));
  });
}

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.blue.bold);
  console.log(`📡 Socket.IO enabled for real-time chat`.cyan);
});
