const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  ownerId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  ownerType: {
    type: String,
    enum: ["account", "page"],
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  actions: [{ type: mongoose.Types.ObjectId, ref: "Action" }]
}, { timestamps: true });

const Model = mongoose.model("FeedBucket", schema);
module.exports = Model;
