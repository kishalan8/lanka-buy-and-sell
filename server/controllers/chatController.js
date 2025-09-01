const mongoose = require('mongoose');
const Message = require('../models/Message');
const Admin = require('../models/Admin');
const User = require('../models/User');

// --- USER: Fetch messages with assigned admin ---
exports.getUserMessages = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, recipientId: adminId },
        { senderId: adminId, recipientId: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// --- ADMIN: Fetch messages with a specific user ---
exports.getAdminMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id; // was req.admin._id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const messages = await Message.find({
      $or: [
        { senderId: user._id, recipientId: adminId },
        { senderId: adminId, recipientId: user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching admin messages:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// --- ADMIN: Get users who messaged ---
exports.getUsersForAdmin = async (req, res) => {
  try {
    const adminObjectId = new mongoose.Types.ObjectId(req.user._id); // was req.admin._id

    const users = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: adminObjectId },
            { recipientId: adminObjectId }
          ]
        }
      },
      {
        $project: {
          userId: {
            $cond: [
              { $eq: ["$senderType", "user"] },
              "$senderId",
              "$recipientId"
            ]
          },
          createdAt: 1
        }
      },
      { $group: { _id: "$userId", lastMessageAt: { $max: "$createdAt" } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $project: { _id: 1, name: "$user.name", email: "$user.email", lastMessageAt: 1 } },
      { $sort: { lastMessageAt: -1 } }
    ]);

    res.json(users);
  } catch (err) {
    console.error("getUsersForAdmin error:", err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// --- ADMIN: Send message to user ---
exports.sendMessageToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message content required' });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const admin = req.user; // was req.admin

    const newMessage = await Message.create({
      content,
      senderId: admin._id,
      senderType: "admin",
      senderName: admin.name,
      senderModel: 'Admin',
      recipientId: user._id,
      recipientType: "user",
      recipientName: user.name,
      recipientModel: 'User',
    });

    const io = req.app.get('io');
    if (io) io.to(user._id.toString()).emit('receiveMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// --- USER: Get assigned admin ---
exports.getAssignedAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ message: 'No admin assigned' });
    res.json({ assignedAdmin: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch assigned admin' });
  }
};

// --- USER: Send message to admin ---
exports.sendMessageToAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message content required' });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const user = req.user;

    const newMessage = await Message.create({
      content,
      senderId: user._id,
      senderType: 'user',
      senderName: user.name,
      senderModel: 'User',
      recipientId: admin._id,
      recipientType: 'admin',
      recipientName: admin.name,
      recipientModel: 'Admin',
    });

    const io = req.app.get('io');
    if (io) io.to(admin._id.toString()).emit('receiveMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};
