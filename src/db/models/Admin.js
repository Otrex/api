const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("Admin", schema);
module.exports = Model;
