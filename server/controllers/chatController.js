const Message = require('../models/Message');
const AdminUser = require('../models/AdminUser');
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
  console.log('Admin making request:', req.admin?._id, req.admin?.name);
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const messages = await Message.find({
    $or: [
      { senderId: req.admin._id, recipientId: userId },
      { senderId: userId, recipientId: req.admin._id }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
};


// --- ADMIN: Get users who messaged ---
exports.getUsersForAdmin = async (req, res) => {
  try {
    // Aggregate unique users who sent messages to this admin
    const users = await Message.aggregate([
      { $match: { recipientId: req.admin._id } },
      { $group: { _id: "$senderId", lastMessageAt: { $max: "$createdAt" } } },
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
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// --- USER: Get assigned admin ---
exports.getAssignedAdmin = async (req, res) => {
  try {
    const admin = await AdminUser.findOne();
    if (!admin) return res.status(404).json({ message: 'No admin assigned' });
    res.json({ assignedAdmin: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch assigned admin' });
  }
};

// --- ADMIN: Send message to user ---
exports.sendMessageToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message content required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const admin = req.admin;

    const newMessage = await Message.create({
      content,
      senderId: admin._id,
      senderType: admin.role,
      senderName: admin.name,
      senderModel: 'AdminUser',
      recipientId: user._id,
      recipientType: user.userType,
      recipientName: user.name,
      recipientModel: 'User',
    });

    // Emit via Socket.IO if user connected
    const io = req.app.get('io');
    if (io) io.to(user._id.toString()).emit('receiveMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};
