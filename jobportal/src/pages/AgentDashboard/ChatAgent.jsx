import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageCircle, 
  User, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Paperclip,
  Smile,
  MoreVertical,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client'; // New: Real-time
import { toast } from 'react-hot-toast'; // New

const ChatAgent = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socket = io('http://localhost:5000'); // New: Socket

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    socket.on('receiveMessage', (msg) => { // New: Real-time receive
      setMessages(prev => [...prev, msg]);
      toast.success('New message from Admin!');
    });
    socket.on('typing', () => setTypingIndicator(true)); // New: Typing
    socket.on('stopTyping', () => setTypingIndicator(false));

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(prev => messages.length === 0 ? true : false); // Only show loading on first load
      const { data } = await axios.get('/api/chat/agent-admin');
      if (data.success) {
        setMessages(data.messages);
        // Simulate admin online status based on recent activity
        const lastAdminMessage = data.messages
          .filter(msg => msg.sender === 'admin')
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        
        if (lastAdminMessage) {
          const timeDiff = Date.now() - new Date(lastAdminMessage.timestamp).getTime();
          setOnlineStatus(timeDiff < 300000); // Online if active within 5 minutes
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { data } = await axios.post('/api/chat/send', {
        message: messageText,
        recipientType: 'admin'
      });

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        socket.emit('sendMessage', data.message); // New: Emit real-time
        toast.success('Message sent!');
        
        // Simulate typing indicator for admin response
        setTypingIndicator(true);
        setTimeout(() => {
          setTypingIndicator(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageText);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(message =>
    searchTerm === '' || 
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MessageBubble = ({ message, isOwnMessage }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isOwnMessage ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {isOwnMessage ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Shield className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className={`rounded-2xl px-4 py-3 relative ${
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-md' 
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed">{message.message}</p>
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
            {isOwnMessage && (
              <CheckCircle className="w-3 h-3 ml-1" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && messages.length === 0) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-md p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                onlineStatus ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Admin Support</h2>
              <p className="text-sm text-gray-600">
                {onlineStatus ? 'Online' : 'Offline'} • Support Team
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={fetchMessages}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 bg-white p-6 overflow-y-auto"
        style={{ maxHeight: '60vh', minHeight: '400px' }}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No messages found' : 'Start a conversation'}
            </h3>
            <p className="text-gray-500 max-w-md">
              {searchTerm 
                ? 'Try adjusting your search terms to find specific messages.'
                : 'Send a message to get support from our admin team. We\'re here to help with your job placement needs!'
              }
            </p>
          </div>
        ) : (
          <>
            {filteredMessages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                isOwnMessage={message.sender === 'agent' || message.senderId === user?._id}
              />
            ))}
            
            <AnimatePresence>
              {typingIndicator && <TypingIndicator />}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white rounded-b-lg shadow-md p-4 border-t">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              disabled={sending}
            />
            
            {/* Message Tools */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <motion.button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-3 rounded-full transition-all duration-200 ${
              newMessage.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
            whileTap={newMessage.trim() && !sending ? { scale: 0.95 } : {}}
          >
            {sending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {onlineStatus && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Admin Online
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;