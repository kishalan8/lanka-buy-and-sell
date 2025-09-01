import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Send,
  Shield,
  Clock,
  CheckCircle,
  RefreshCw,
  Paperclip,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminChat = () => {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("authUser"));

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  // Fetch users list
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chats/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [token]);

  // Socket.IO connection (connect only once)
  useEffect(() => {
    if (!token) return;

    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => console.log("✅ Socket connected:", socketRef.current.id));
    socketRef.current.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

    // Receive messages
    socketRef.current.on("receiveMessage", (msg) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.recipientId === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Typing indicators
    socketRef.current.on("typing", ({ from }) => {
      if (selectedUser && from === selectedUser._id) setTypingIndicator(true);
    });
    socketRef.current.on("stopTyping", ({ from }) => {
      if (selectedUser && from === selectedUser._id) setTypingIndicator(false);
    });

    return () => socketRef.current.disconnect();
  }, [token]);

  // Join a room when a user is selected
  useEffect(() => {
    if (!selectedUser || !socketRef.current) return;

    socketRef.current.emit("joinRoom", selectedUser._id);

    // Fetch chat history for selected user
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chats/admin/${selectedUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();

    return () => {
      socketRef.current.emit("leaveRoom", selectedUser._id);
      setMessages([]);
      setTypingIndicator(false);
    };
  }, [selectedUser, token]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const message = {
      content,
      recipientId: selectedUser._id,
      senderId: admin._id,
      senderType: "admin",
      senderName: admin.name,
      createdAt: new Date(),
    };

    try {
      socketRef.current.emit("sendMessage", message);
      setMessages((prev) => [...prev, message]);

      await axios.post(
        `http://localhost:5000/api/chats/admin/${selectedUser._id}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  // Format timestamps
  const formatTime = (ts) => {
    const date = new Date(ts);
    const diff = (Date.now() - date) / 60000;
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const MessageBubble = ({ msg }) => {
    const isOwn = msg.senderType === "admin";
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn ? "bg-blue-600" : "bg-gray-600"}`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className={`rounded-2xl px-4 py-3 relative ${isOwn ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
            <p className="text-sm leading-relaxed">{msg.content}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
              <Clock className="w-3 h-3" />
              <span>{formatTime(msg.createdAt || msg.timestamp)}</span>
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
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen">
      {/* Users list */}
      <div className="w-1/4 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        {users.map(u => (
          <div
            key={u._id}
            className={`p-2 cursor-pointer ${selectedUser?._id === u._id ? "bg-gray-200" : ""}`}
            onClick={() => setSelectedUser(u)}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: '60vh', minHeight: '400px' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Shield className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Start a conversation</h3>
              <p className="text-gray-500 max-w-md">Select a user and send a message. They will be notified instantly.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)}
              <AnimatePresence>{typingIndicator && <TypingIndicator />}</AnimatePresence>
              <div ref={messagesEndRef}></div>
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-b-lg shadow-md p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
                rows={1}
                onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                disabled={sending || !selectedUser}
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
              disabled={!newMessage.trim() || sending || !selectedUser}
              className={`p-3 rounded-full transition-all duration-200 ${newMessage.trim() && !sending ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
              whileTap={newMessage.trim() && !sending ? { scale: 0.95 } : {}}
            >
              {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
