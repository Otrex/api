const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  verificationCode: {
    type: String
  },
  verificationToken: {
    type: String
  },
  verificationCodeExpiresAt: {
    type: Date
  },
  verificationAttempts: [
    {
      ip: {
        type: String
      },
      timestamp: {
        type: Date, default: Date.now
      }
    }
  ],
  verifiedAt: {
    type: Date
  }
}, { timestamps: true });

const Model = mongoose.model("PhoneVerification", schema);
module.exports = Model;
