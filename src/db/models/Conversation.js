const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  initiatedBy: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  members: [mongoose.Types.ObjectId]
}, { timestamps: true });

const Model = mongoose.model("Conversation", schema);
module.exports = Model;
