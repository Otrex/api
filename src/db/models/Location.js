const mongoose = require("mongoose");
const { Schema } = mongoose;

const Point = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

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
  categoryId: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private"
  },
  followersCount: {
    type: Number,
    default: 0
  },
  preciseLocation: {
    type: Point,
    required: true
  },
  plusCode: {
    type: String,
    required: true
  },
  eddress: {
    type: String
  },
  tags: [
    { type: String }
  ]
}, { timestamps: true, toObject: { versionKey: false } });

schema.index({ preciseLocation: "2dsphere" });
schema.index({ visibility: 1, eddress: 1 });

const Model = mongoose.model("Location", schema);
module.exports = Model;
