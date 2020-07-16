const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true
  },
  name: {
    first: {
      type: String
    },
    last: {
      type: String
    }
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
  },
  location: {
    type: String
  },
  profileImage: { type: String },
  coverImage: { type: String },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private"
  },
  status: {
    type: String,
    default: "active"
  }
}, { timestamps: true });

schema.index({
  username: 1
});

const Model = mongoose.model("Account", schema);
module.exports = Model;
