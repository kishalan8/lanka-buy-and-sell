// src/pages/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user, admin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const scrollRef               = useRef();

  const userId      = user?._id;
  const isAdminView = !!admin;
  const currentId   = isAdminView ? admin._id : userId;

  useEffect(() => {
    if (!currentId) return;

    // 1) Join the room
    console.log("🔔 Joining room:", currentId);
    socket.emit("joinRoom", { userId: currentId, role: isAdminView ? "admin" : "user" });

    // 2) Load history from DB
    axios.get(`/api/chats/${currentId}`)
      .then(res => {
        console.log("📥 Chat history:", res.data);
        setMessages(res.data);
      })
      .catch(err => {
        console.error("❌ Failed to load history:", err);
      });

    // 3) Listen for incoming
    const handler = msg => {
      console.log("📨 Received message via socket:", msg);
      if (msg.senderId === currentId || msg.recipientId === currentId) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on("receiveMessage", handler);

    return () => {
      socket.off("receiveMessage", handler);
    };
  }, [currentId, isAdminView]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !currentId) return;

    const msg = {
      content:     input,
      senderId:    currentId,
      senderType:  isAdminView ? "admin" : "user",
      recipientId: isAdminView ? userId : admin?._id || "admin"
    };

    console.log("📤 Sending message:", msg);
    socket.emit("sendMessage", msg);

    setMessages(prev => [...prev, { ...msg, createdAt: new Date() }]);
    setInput("");
  };

  if (!currentId) return <p>Please log in to access chat.</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 max-w-[75%] p-2 rounded ${
              m.senderType === (isAdminView ? "admin" : "user")
                ? "self-end bg-blue-100"
                : "self-start bg-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t flex">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          className="flex-1 border rounded p-2 mr-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
