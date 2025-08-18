// Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user, loading: authLoading, setError } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socketLoading, setSocketLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch assigned admin and previous messages
  useEffect(() => {
    if (!user) return;

    const fetchChat = async () => {
      try {
        const token = localStorage.getItem('token');

        // Step 1: get assigned admin
        const adminRes = await axios.get('http://localhost:5000/api/chats/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const assignedAdmin = adminRes.data.assignedAdmin;
        setAdmin(assignedAdmin);

        // Step 2: get previous messages with that admin
        const messagesRes = await axios.get(
          `http://localhost:5000/api/chats/messages/${assignedAdmin._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(messagesRes.data);
      } catch (err) {
        console.error('Failed to fetch chat:', err.response?.data || err.message);
        setError('Failed to load chat');
      }
    };

    fetchChat();
  }, [user, setError]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!user || !admin) return;

    const socket = io('http://localhost:5000', {
      auth: { userId: user._id, role: 'user' },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Join user room
    socket.emit('joinRoom', { userId: user._id, role: 'user' });

    // Listen for incoming messages
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('messageSent', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('messageError', (err) => {
      console.error('Socket messageError:', err);
      setError(err.error || 'Message failed');
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket:', socket.id);
      setSocketLoading(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err);
      setError('Socket connection failed');
    });

    return () => {
      socket.disconnect();
    };
  }, [user, admin, setError]);

  // Send a message
  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !admin) return;

    socketRef.current.emit('sendMessage', {
      content: input,
      senderId: user._id,
      senderType: 'user', // backend will assign admin
    });

    setInput('');
  };

  if (authLoading || socketLoading || !admin) return <div>Loading chat...</div>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', maxWidth: '500px' }}>
      <h2>Chat with {admin.name}</h2>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'scroll',
          border: '1px solid #eee',
          padding: '5px',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '5px' }}>
            <strong>{msg.senderType === 'user' ? user.name : admin.name}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '5px' }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: '5px 10px' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
