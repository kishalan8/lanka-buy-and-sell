const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/AdminAuth');
const Message = require('../models/Message');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

// @desc    Get chat users (for admins)
// @route   GET /api/chat/users
// @access  Private (Admin only)
router.get('/users', protect, async (req, res) => {
  try {
    // Only admins can see all users
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied" 
      });
    }

    // Get unique user IDs who have sent messages
    const userIds = await Message.distinct("senderId", { 
      senderType: { $in: ["user", "candidate", "agent"] }
    });
    
    // Fetch user details
    const users = await User.find({ _id: { $in: userIds } })
      .select('name firstname lastname email userType companyName');
    
    // Get latest message for each user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: user._id },
            { recipientId: user._id }
          ]
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderType: lastMessage.senderType
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: usersWithLastMessage
    });

  } catch (err) {
    console.error('Failed to fetch chat users:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch users" 
    });
  }
});

// @desc    Get messages between user and admin
// @route   GET /api/chat/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    let query;

    if (isAdmin) {
      // Admin can see messages with any user
      query = {
        $or: [
          { senderId: userId, recipientId: currentUserId },
          { senderId: currentUserId, recipientId: userId },
          // Support for messages where admin is recipient
          { senderId: userId, recipientType: 'admin' },
          { recipientId: userId, senderType: 'admin' }
        ]
      };
    } else {
      // Regular users (candidates/agents) can only see their own messages
      if (userId !== currentUserId) {
        return res.status(403).json({ 
          success: false, 
          error: "Access denied" 
        });
      }

      query = {
        $or: [
          { senderId: currentUserId },
          { recipientId: currentUserId }
        ]
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      data: messages
    });

  } catch (err) {
    console.error('Failed to fetch messages for', req.params.userId, err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
});

// @desc    Send message
// @route   POST /api/chat/send
// @access  Private
router.post('/send', protect, async (req, res) => {
  try {
    const { content, recipientId, recipientType } = req.body;
    const senderId = req.user._id;
    const senderType = req.user.role === 'admin' ? 'admin' : req.user.userType;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Validate recipient
    let recipient;
    if (recipientType === 'admin') {
      recipient = await Admin.findById(recipientId);
    } else {
      recipient = await User.findById(recipientId);
    }

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    // Create message
    const message = await Message.create({
      content: content.trim(),
      senderId,
      senderType,
      recipientId,
      recipientType: recipientType || 'user'
    });

    // Populate sender and recipient details for response
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name firstname lastname email userType companyName')
      .populate('recipientId', 'name firstname lastname email userType companyName');

    res.json({
      success: true,
      data: populatedMessage
    });

  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message' 
    });
  }
});

// @desc    Get chat summary for user dashboard
// @route   GET /api/chat/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    let unreadCount, totalMessages, recentMessages;

    if (isAdmin) {
      // Admin summary - messages from all users
      unreadCount = await Message.countDocuments({
        recipientType: 'admin',
        isRead: false
      });

      totalMessages = await Message.countDocuments({
        $or: [
          { senderType: 'admin' },
          { recipientType: 'admin' }
        ]
      });

      recentMessages = await Message.find({
        $or: [
          { senderType: 'admin' },
          { recipientType: 'admin' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'name firstname lastname userType companyName')
      .populate('recipientId', 'name firstname lastname userType companyName');

    } else {
      // User summary - only their messages
      unreadCount = await Message.countDocuments({
        recipientId: userId,
        isRead: false
      });

      totalMessages = await Message.countDocuments({
        $or: [
          { senderId: userId },
          { recipientId: userId }
        ]
      });

      recentMessages = await Message.find({
        $or: [
          { senderId: userId },
          { recipientId: userId }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'name firstname lastname userType companyName')
      .populate('recipientId', 'name firstname lastname userType companyName');
    }

    res.json({
      success: true,
      data: {
        unreadCount,
        totalMessages,
        recentMessages
      }
    });

  } catch (err) {
    console.error('Failed to get chat summary:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get chat summary' 
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/chat/mark-read
// @access  Private
router.put('/mark-read', protect, async (req, res) => {
  try {
    const { messageIds, conversationWith } = req.body;
    const userId = req.user._id;

    let query;

    if (messageIds && messageIds.length > 0) {
      // Mark specific messages as read
      query = {
        _id: { $in: messageIds },
        recipientId: userId
      };
    } else if (conversationWith) {
      // Mark all messages in a conversation as read
      query = {
        senderId: conversationWith,
        recipientId: userId,
        isRead: false
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either messageIds or conversationWith is required'
      });
    }

    const result = await Message.updateMany(query, {
      isRead: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`
    });

  } catch (err) {
    console.error('Failed to mark messages as read:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark messages as read' 
    });
  }
});

// @desc    Delete message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
router.delete('/message/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Check if user owns the message or is admin
    if (!isAdmin && message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (err) {
    console.error('Failed to delete message:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete message' 
    });
  }
});

module.exports = router;