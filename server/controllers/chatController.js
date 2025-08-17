const Chat = require('../models/ChatUser');
const Message = require('../models/Message');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const ChatAssignment = require('../models/ChatAssignment');

// Enhanced chat controller with assignment logic
exports.getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.user._id;
    
    // For users requesting chat, find or create assignment
    const requestingUser = req.user.role === 'user';
    
    if (requestingUser) {
      // User is requesting chat - find or create assignment
      let assignment = await ChatAssignment.findOne({ userId: req.user._id })
        .populate('adminId', 'name email adminType');

      if (!assignment) {
        // Find available admin of correct type
        const availableAdmin = await Admin.findOne({
          adminType: req.user.userType,
          isActive: true
        });

        if (!availableAdmin) {
          return res.status(404).json({ error: `No available ${req.user.userType} admin found` });
        }

        // Create new assignment
        assignment = await ChatAssignment.create({
          userId: req.user._id,
          adminId: availableAdmin._id,
          userType: req.user.userType
        });

        await assignment.populate('adminId', 'name email adminType');
      }

      res.json({
        success: true,
        assignment,
        assignedAdmin: assignment.adminId
      });
    } else {
      // Admin accessing specific chat
      const assignment = await ChatAssignment.findOne({ 
        userId: userId,
        adminId: adminId
      }).populate('userId', 'name firstname lastname email userType companyName');

      if (!assignment) {
        return res.status(404).json({ error: 'Chat assignment not found' });
      }

      res.json({
        success: true,
        assignment
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get chat messages with assignment validation
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate assignment exists
    let assignment;
    if (req.user.role === 'admin') {
      assignment = await ChatAssignment.findOne({
        userId: userId,
        adminId: req.user._id
      });
    } else {
      assignment = await ChatAssignment.findOne({
        userId: req.user._id
      });
    }

    if (!assignment) {
      return res.status(404).json({ error: 'Chat assignment not found' });
    }

    // Get messages between user and assigned admin
    const messages = await Message.find({
      $or: [
        { senderId: assignment.userId.toString(), recipientId: assignment.adminId.toString() },
        { senderId: assignment.adminId.toString(), recipientId: assignment.userId.toString() }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users who have messages (for admin)
exports.getUsersForAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get assignments for this admin
    const assignments = await ChatAssignment.find({ 
      adminId: req.user._id,
      status: 'active'
    })
    .populate('userId', 'name firstname lastname email userType companyName picture')
    .sort({ lastMessageAt: -1 });

    const users = assignments.map(assignment => ({
      ...assignment.userId.toObject(),
      assignmentId: assignment._id,
      lastMessageAt: assignment.lastMessageAt,
      messageCount: assignment.messageCount
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enhanced message sending with assignment update
exports.sendMessage = async (req, res) => {
  try {
    const { content, recipientId, senderType } = req.body;
    const senderId = req.user._id;

    // Create message
    const message = await Message.create({
      content,
      senderId: senderId.toString(),
      recipientId,
      senderType: senderType || (req.user.role === 'admin' ? 'admin' : 'user')
    });

    // Update assignment's last message time
    if (req.user.role === 'admin') {
      await ChatAssignment.findOneAndUpdate(
        { adminId: senderId, userId: recipientId },
        { 
          lastMessageAt: new Date(),
          $inc: { messageCount: 1 }
        }
      );
    } else {
      await ChatAssignment.findOneAndUpdate(
        { userId: senderId },
        { 
          lastMessageAt: new Date(),
          $inc: { messageCount: 1 }
        }
      );
    }

    res.json({
      success: true,
      message
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get admin's chat assignments
exports.getAdminChats = async (req, res) => {
  try {
    const assignments = await ChatAssignment.find({ 
      adminId: req.user._id,
      status: 'active'
    })
    .populate('userId', 'name firstname lastname email userType companyName picture')
    .sort({ lastMessageAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's active chat assignment
exports.getUserChat = async (req, res) => {
  try {
    const assignment = await ChatAssignment.findOne({
      userId: req.user._id,
      status: 'active'
    }).populate('adminId', 'name email adminType');

    if (!assignment) {
      return res.status(404).json({ error: 'No active chat assignment found' });
    }

    res.json({
      success: true,
      assignment,
      assignedAdmin: assignment.adminId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};