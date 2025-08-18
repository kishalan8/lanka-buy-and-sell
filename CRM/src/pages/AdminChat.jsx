import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Send } from "lucide-react";

const AdminChat = () => {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("authUser"));

  const socket = useRef();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // --- Initialize Socket.IO ---
  useEffect(() => {
    if (!admin || !token) return;

    socket.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("✅ Socket connected:", socket.current.id);
    });

    socket.current.on("receiveMessage", (msg) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.recipientId === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.current.on("authError", (err) => {
      console.error("Socket auth error:", err);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [admin, token, selectedUser]);

  // --- Fetch users who messaged ---
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chats/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Fetch messages with selected user ---
  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chats/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);

      // Join the room for real-time chat
      socket.current.emit("joinRoom", { userId, role: "admin", token });
    } catch (err) {
      console.error("Failed to fetch messages:", err.response?.data || err.message);
      setMessages([]);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  // --- Send message ---
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const payload = {
      content: newMessage,
      recipientId: selectedUser._id,
    };

    socket.current.emit("sendMessage", payload);
    setMessages((prev) => [...prev, { ...payload, senderId: admin._id, senderType: "admin", senderName: admin.name, createdAt: new Date() }]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Users list */}
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Users</h2>
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => handleSelectUser(user)}
            className={`p-2 mb-2 cursor-pointer rounded ${selectedUser?._id === user._id ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-600">{user.email}</div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col p-4">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 p-2 rounded max-w-xs ${msg.senderId === admin._id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"}`}
                >
                  {msg.content}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
              />
              <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chat
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
