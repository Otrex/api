const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  contactId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Model = mongoose.model("Contact", schema);
module.exports = Model;
