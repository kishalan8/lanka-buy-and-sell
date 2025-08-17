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
const ChatUser = require('./models/ChatUser');
const ChatAssignment = require('./models/ChatAssignment');

dotenv.config();
const app = express();
const server = http.createServer(app);

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173','http://localhost:5174'],
    credentials: true
  }
});

// --- Middleware ---
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// --- CORS for APIs ---
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
  })
);

// --- Serve uploaded files with CORS ---
app.use(
  '/uploads',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // your frontend URLs
    credentials: true,
  }),
  express.static(path.join(__dirname, 'uploads'))
);


// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'.green))
  .catch((err) => console.error('MongoDB connection error:'.red, err));

// --- Socket.IO Handlers ---
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);

  socket.on('joinRoom', async ({ userId, role }) => {
    socket.join(userId);
    console.log(`✅ ${role} joined room ${userId}`);

    try {
      await ChatUser.findOneAndUpdate(
        { userId },
        { socketId: socket.id, role, isOnline: true },
        { upsert: true }
      );

      if (role !== 'admin') {
        let assignment = await ChatAssignment.findOne({ userId });
        if (!assignment) {
          const Admin = require('./models/Admin');
          const availableAdmins = await Admin.find({
            isActive: true,
            adminRole:
              role === 'candidate' ? 'candidate_admin' : 'agent_admin',
          });
          if (availableAdmins.length > 0) {
            const assignedAdmin =
              availableAdmins[
                Math.floor(Math.random() * availableAdmins.length)
              ];
            assignment = await ChatAssignment.create({
              userId,
              adminId: assignedAdmin._id,
              userRole: role,
              assignedAt: new Date(),
            });
            console.log(
              `🔗 Auto-assigned ${role} ${userId} to ${assignedAdmin.adminRole} ${assignedAdmin._id}`
            );
          }
        }
      }
    } catch (err) {
      console.error('❌ Error in joinRoom:', err);
    }
  });

  socket.on('sendMessage', async (data) => {
    const { content, senderId, senderType, recipientId } = data;
    if (!content || !senderId || !senderType) {
      return socket.emit('messageError', { error: 'Missing required fields' });
    }

    try {
      let finalRecipientId = recipientId;

      if (senderType === 'user') {
        const assignment = await ChatAssignment.findOne({ userId: senderId });
        if (assignment) finalRecipientId = assignment.adminId.toString();
        else return socket.emit('messageError', { error: 'No admin assigned yet' });
      }

      if (senderType === 'admin' && recipientId) {
        const assignment = await ChatAssignment.findOne({ userId: recipientId, adminId: senderId });
        if (!assignment) return socket.emit('messageError', { error: 'Not authorized to chat with this user' });
      }

      const newMsg = await Message.create({
        content,
        senderId,
        senderType,
        recipientId: finalRecipientId,
        recipientType: senderType === 'admin' ? 'user' : 'admin',
        createdAt: new Date(),
      });

      if (senderType === 'user') {
        await ChatUser.updateOne(
          { userId: senderId },
          { $inc: { unreadCount: 1 }, lastMessage: content, updatedAt: new Date() },
          { upsert: true }
        );
      }

      io.to(finalRecipientId).emit('receiveMessage', newMsg);
      socket.emit('messageSent', newMsg);

      if (senderType === 'user') socket.broadcast.emit('receiveMessage', newMsg);
    } catch (err) {
      console.error('❌ Error saving message:', err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    ChatUser.updateOne(
      { socketId: socket.id },
      { $set: { isOnline: false }, $unset: { socketId: 1 } }
    ).catch((err) => console.error('Error updating offline status:', err));
  });

  socket.on('updateStatus', (updatedData) => io.emit('statusUpdate', updatedData));
  socket.on('newInquiryResponse', (response) => io.emit('inquiryResponse', response));
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
  console.log(`💾 MongoDB connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`.yellow);
});
