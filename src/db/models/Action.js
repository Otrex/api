const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  actorId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  fanOutStatus: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending"
  },
  description: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("Action", schema);
module.exports = Model;
