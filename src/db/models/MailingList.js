const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true
  }
}, { timestamps: true });

const Model = mongoose.model("MailingList", schema);
module.exports = Model;
