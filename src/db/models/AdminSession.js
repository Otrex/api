const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  adminId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

const Model = mongoose.model("AdminSession", schema);
module.exports = Model;
