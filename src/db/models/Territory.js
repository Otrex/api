const mongoose = require("mongoose");
const { Schema } = mongoose;

const Polygon = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Polygon"],
    required: true
  },
  coordinates: {
    type: [[[Number]]],
    required: true
  }
});

const MultiPolygon = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MultiPolygon"],
    required: true
  },
  coordinates: {
    type: [[[[Number]]]],
    required: true
  }
});

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  properties: {
    ADMIN: String,
    ISO_A3: String
  },
  geometry: {
    type: Schema.Types.Mixed,
    required: false
  },
  trackersCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

schema.index({ geometry: "2dsphere" });

const Model = mongoose.model("Territory", schema);
module.exports = Model;
