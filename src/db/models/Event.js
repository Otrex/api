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
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  coverImage: {
    type: String
  },
  time: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private"
  },
  locationId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  categoryId: {
    type: mongoose.Types.ObjectId,
    required: true
  }
}, { timestamps: true });

schema.index({ locationId: 1 });
schema.index({ visibility: 1 });

const Model = mongoose.model("Event", schema);
module.exports = Model;
