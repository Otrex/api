const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  followerId: {
    type: mongoose.Types.ObjectId,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("AccountFollower", schema);
module.exports = Model;
