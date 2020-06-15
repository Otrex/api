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
  password: {
    type: String,
    required: true
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
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Model = mongoose.model("Account", schema);
module.exports = Model;
