const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  ownerId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  ownerType: {
    type: String,
    enum: ["location", "project", "event"],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

schema.index({ ownerId: 1, ownerType: 1 });

const Model = mongoose.model("Photo", schema);
module.exports = Model;
