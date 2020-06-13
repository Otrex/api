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
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  name: {
    type: String
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private"
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
    id: {
      type: String,
      required: true
    }
  }
}, { timestamps: true });

schema.index({ preciseLocation: "2dsphere" });

const Model = mongoose.model("Location", schema);
module.exports = Model;
