import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Users,
  Building,
  Send,
  Search,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCircle,
  RefreshCw,
  Filter,
  ArrowRight
} from 'lucide-react';

const socket = io('http://localhost:5000');

const AdminChat = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    setupSocketListeners();
    
    return () => {
      socket.off('receiveMessage');
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    socket.emit('joinRoom', { userId: admin._id, role: 'admin' });
    
    socket.on('receiveMessage', (message) => {
      if (message.senderId === selectedUserId || message.recipientId === selectedUserId) {
        setMessages(prev => [...prev, message]);
      }
      // Update user list to show new message indicator
      fetchUsers();
    });

    socket.on('userOnline', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('userOffline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/admin/chat/users');
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/admin/chat/messages/${userId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUserId) return;

    const message = {
      content: input,
      senderId: admin._id,
      recipientId: selectedUserId,
      senderType: 'admin',
    };

    socket.emit('sendMessage', message);
    setMessages(prev => [...prev, { ...message, createdAt: new Date() }]);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter and search users
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = userTypeFilter === 'all' || user.userType === userTypeFilter;

    return matchesSearch && matchesFilter;
  });

  const selectedUser = allUsers.find(user => user._id === selectedUserId);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (user) => {
    if (user.userType === 'candidate') {
      return user.firstname && user.lastname 
        ? `${user.firstname} ${user.lastname}`
        : user.name || 'Unnamed User';
    } else {
      return user.companyName || user.name || 'Unnamed Company';
    }
  };

  const getUserAvatar = (user) => {
    if (user.userType === 'candidate') {
      return (user.firstname?.[0] || user.name?.[0] || 'U').toUpperCase();
    } else {
      return (user.companyName?.[0] || user.name?.[0] || 'C').toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onLogout={handleLogout} />
        <div className="ml-60 flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content - Fixed positioning to account for sidebar */}
      <div className="ml-60 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                All Conversations
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage all user conversations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-indigo-700 font-medium">
                  {allUsers.length} Total Users
                </span>
              </div>
              <button 
                onClick={fetchUsers}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Users List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserTypeFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    userTypeFilter === 'all' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setUserTypeFilter('candidate')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    userTypeFilter === 'candidate' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Candidates
                </button>
                <button
                  onClick={() => setUserTypeFilter('agent')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    userTypeFilter === 'agent' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Agents
                </button>
              </div>
            </div>

            {/* Users */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedUserId === user._id ? 'bg-indigo-50 border-r-4 border-r-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          user.userType === 'candidate' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          {getUserAvatar(user)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          onlineUsers.has(user._id) ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {getUserDisplayName(user)}
                          </h3>
                          {user.userType === 'candidate' ? (
                            <Users className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Building className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {user.userType === 'candidate' 
                            ? user.email
                            : `${user.contactPerson || 'Unknown'} • ${user.email}`
                          }
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.userType === 'candidate' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {user.userType}
                          </span>
                          {user.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatTime(user.lastMessageAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      {user.messageCount > 0 && (
                        <div className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {user.messageCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          selectedUser.userType === 'candidate' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          {getUserAvatar(selectedUser)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.has(selectedUser._id) ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {getUserDisplayName(selectedUser)}
                          {selectedUser.userType === 'candidate' ? (
                            <Users className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Building className="w-4 h-4 text-purple-500" />
                          )}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {selectedUser.email}
                          </span>
                          {selectedUser.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {selectedUser.phoneNumber}
                            </span>
                          )}
                          {(selectedUser.address || selectedUser.companyAddress) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {selectedUser.address || selectedUser.companyAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selectedUser.userType === 'candidate' 
                          ? 'bg-blue-100 text-blue-800' 
                          : selectedUser.isVerified 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.userType === 'candidate' 
                          ? 'Job Seeker' 
                          : selectedUser.isVerified ? 'Verified Company' : 'Verification Pending'
                        }
                      </span>
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.senderType === 'admin'
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              message.senderType === 'admin' ? 'text-indigo-100' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(message.createdAt)}</span>
                              {message.senderType === 'admin' && (
                                <CheckCircle className="w-3 h-3 ml-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32"
                        rows={1}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>All conversations are monitored and recorded</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a User</h3>
                  <p className="text-gray-500 max-w-sm">
                    Choose a user from the list to start or continue monitoring their conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;