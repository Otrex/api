const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  socketId: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("WebSocketConnection", schema);
module.exports = Model;
