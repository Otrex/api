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
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
    type: String
  }
}, { timestamps: true });

schema.index({ preciseLocation: "2dsphere" });
schema.index({ visibilty: 1, eddress: 1 });

const Model = mongoose.model("Location", schema);
module.exports = Model;
