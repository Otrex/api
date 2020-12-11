const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  conversationId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  senderId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    enum: ["text", "photo", "video", "audio", "location"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isForwarded: {
    type: Boolean,
    default: false
  },
  deletedBy: [mongoose.Types.ObjectId]
}, { timestamps: true });

const Model = mongoose.model("ConversationMessage", schema);
module.exports = Model;
