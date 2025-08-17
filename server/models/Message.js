const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderType: { type: String, enum: ["user", "admin"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
