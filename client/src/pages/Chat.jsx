// Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, User, Shield, Clock, CheckCircle, RefreshCw, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const Chat = () => {
  const { user, loading: authLoading, setError } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(false);

  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // Fetch admin & messages
  useEffect(() => {
    if (!user) return;

    const fetchChat = async () => {
      try {
        const token = localStorage.getItem('token');

        // Get assigned admin
        const adminRes = await axios.get('http://localhost:5000/api/chats/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const assignedAdmin = adminRes.data.assignedAdmin;
        setAdmin(assignedAdmin);

        // Get previous messages
        const messagesRes = await axios.get(
          `http://localhost:5000/api/chats/messages/${assignedAdmin._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(messagesRes.data);

        // Simulate online status
        const lastAdminMessage = messagesRes.data
          .filter(m => m.senderType === 'admin')
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        if (lastAdminMessage) {
          const diff = Date.now() - new Date(lastAdminMessage.timestamp).getTime();
          setOnlineStatus(diff < 300000);
        }
      } catch (err) {
        console.error('Failed to fetch chat:', err.response?.data || err.message);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [user, setError]);

  // Socket.IO setup
  useEffect(() => {
    if (!user || !admin) return;

    const socket = io('http://localhost:5000', {
      auth: { userId: user._id, role: 'user' },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('joinRoom', { userId: user._id, role: 'user' });

    socket.on('receiveMessage', msg => {
      setMessages(prev => [...prev, msg]);
      toast.success('New message from Admin!');
    });

    socket.on('typing', () => setTypingIndicator(true));
    socket.on('stopTyping', () => setTypingIndicator(false));

    socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
    socket.on('connect_error', err => setError('Socket connection failed'));

    return () => socket.disconnect();
  }, [user, admin, setError]);

  // Send message via backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const messageText = input.trim();
    setInput('');
    setSending(true);

    try {
      const token = localStorage.getItem('token');

      // Send message to backend
      const res = await axios.post(
        `http://localhost:5000/api/chats/messages/${admin._id}`,
        { content: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, res.data]);

      // Emit typing indicator
      socketRef.current.emit('typing', { userId: user._id, role: 'user' });
      setTimeout(() => socketRef.current.emit('stopTyping', { userId: user._id, role: 'user' }), 2000);
    } catch (err) {
      console.error(err);
      setInput(messageText);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Filter messages (optional)
  const formatTime = ts => {
    const date = new Date(ts);
    const diff = (Date.now() - date) / 60000;
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ msg }) => {
    const isOwn = msg.senderType === 'user';
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-blue-600' : 'bg-gray-600'}`}>
            {isOwn ? <User className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-white" />}
          </div>
          <div className={`rounded-2xl px-4 py-3 relative ${isOwn ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
            <p className="text-sm leading-relaxed">{msg.content}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3" />
              <span>{formatTime(msg.timestamp)}</span>
              {isOwn && <CheckCircle className="w-3 h-3 ml-1" />}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const TypingIndicator = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex justify-start mb-4">
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

  if (authLoading || loading || !admin) return (
    <div className="p-6 flex items-center justify-center h-96">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      {/* Header & Chat messages */}
      <div className="bg-white rounded-t-lg shadow-md p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{admin.name}</h2>
            <p className="text-sm text-gray-600">{onlineStatus ? 'Online' : 'Offline'} • Support Team</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white p-6 overflow-y-auto" style={{ maxHeight: '60vh', minHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Start a conversation</h3>
            <p className="text-gray-500 max-w-md">Send a message to get support from our admin team. We’re here to help!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)}
            <AnimatePresence>{typingIndicator && <TypingIndicator />}</AnimatePresence>
            <div ref={messagesEndRef}></div>
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-lg shadow-md p-4 border-t">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
              rows={1}
              onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
              disabled={sending}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-all duration-200 ${input.trim() && !sending ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            whileHover={input.trim() && !sending ? { scale: 1.05 } : {}}
            whileTap={input.trim() && !sending ? { scale: 0.95 } : {}}
          >
            {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
