import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Headphones, Clock } from "lucide-react";
import socket from "../../socket";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Inquiries = () => {
  const { user, admin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isAdmin = !!admin;
  const currentId = isAdmin ? admin?._id : user?._id;
  const recipientId = isAdmin ? user?._id : admin?._id || "admin";

  // --- Load messages and join room ---
  useEffect(() => {
    if (!currentId) return;

    socket.emit("joinRoom", { userId: currentId, role: isAdmin ? "admin" : "user" });

    axios.get(`/api/chat/${currentId}`)
      .then((res) => {
        const data = res.data.data || res.data;
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
        setMessages([]);
        setLoading(false);
      });

    const handleReceive = (msg) => {
      if (msg.senderId === currentId || msg.recipientId === currentId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("receiveMessage", handleReceive);

    return () => socket.off("receiveMessage", handleReceive);
  }, [currentId, isAdmin]);

  // --- Scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send message ---
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const msgPayload = {
      content: inputValue,
      senderId: currentId,
      senderType: isAdmin ? "admin" : "user",
      recipientId,
    };

    // Optimistic update
    setMessages((prev) => [...prev, { ...msgPayload, createdAt: new Date(), _id: Date.now().toString() }]);
    setInputValue("");

    try {
      await axios.post("/api/chat/send", {
        content: msgPayload.content,
        recipientId,
        recipientType: isAdmin ? "user" : "admin",
      });

      socket.emit("sendMessage", msgPayload);
    } catch (err) {
      console.error("Failed to send message:", err);
      // fallback: emit via socket
      socket.emit("sendMessage", msgPayload);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!currentId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <motion.div className="bg-white/70 backdrop-blur-xl border-2 border-gray-300/30 rounded-2xl shadow-lg">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 rounded-xl bg-gradient-primary text-white shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
              >
                <Headphones className="w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="text-heading-lg pb-3 font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Inquiries
                </h1>
                <motion.div
                  className="h-1 w-24 rounded-full"
                  style={{ background: "linear-gradient(90deg, #1B3890, #0F79C5)" }}
                  initial={{ width: 0 }}
                  animate={{ width: 96 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>
            </div>
          </div>
          <motion.div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-[var(--color-secondary)]" />
            <span>Office Hours: 8:00 AM - 5:00 PM (Mon-Fri)</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <AnimatePresence>
          {loading ? (
            <motion.div className="text-center text-gray-500 mt-8">Loading messages...</motion.div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-500 mt-8"
            >
              <Headphones className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet. Start a conversation!</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => {
              const isSent = msg.senderId === currentId;
              return (
                <motion.div
                  key={msg._id || i}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-2xl p-4 shadow-lg ${isSent
                        ? "bg-blue-300 text-gray-900 ml-auto"
                        : "bg-white/70 backdrop-blur-xl border border-gray-300/80 text-gray-800"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isSent
                            ? "bg-white/70 text-white"
                            : "bg-gradient-primary text-white"
                          }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isSent ? <User className="w-4 h-4 text-black/70" /> : <Headphones className="w-4 h-4" />}
                      </motion.div>
                      <div>
                        <span className={`text-sm font-medium ${isSent ? "text-gray-900" : "text-gray-700"}`}>
                          {isSent ? "You" : "Support"}
                        </span>
                        <span className={`text-xs block ${isSent ? "text-gray-900/70" : "text-gray-500"}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div className="bg-white/70 backdrop-blur-xl border-t border-white/30 shadow-lg px-3 py-2 md:p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full p-4 pr-16 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none bg-white/80 backdrop-blur-sm"
              style={{ minHeight: "56px", maxHeight: "120px", height: "auto" }}
            />
            <div className="absolute right-2 bottom-2 md:bottom-4 flex items-center">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-xl transition-all ${inputValue.trim()
                    ? "bg-gradient-primary text-white shadow-lg duration-100"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-2 pt-2 pb-1 pl-2 overflow-x-auto scrollbar-hide">
          {["Job Applications", "Salary Info", "Work Permits", "Contact Details"].map((action) => (
            <motion.button
              key={action}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputValue(action)}
              className="px-4 py-2 text-sm bg-blue-50 text-[var(--color-secondary)] rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              {action}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Inquiries;
