const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  resetToken: {
    type: String,
    required: true
  },
  resetTokenExpiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("PasswordReset", schema);
module.exports = Model;
