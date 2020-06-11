const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true
  },
  countryCode: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumberVerifiedAt: {
    type: Date
  }
}, { timestamps: true });

const Model = mongoose.model("Account", schema);
module.exports = Model;
