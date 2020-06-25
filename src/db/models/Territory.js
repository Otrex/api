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

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  bounds: {
    type: Polygon,
    required: false
  },
  trackersCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

schema.index({ bounds: "2dsphere" });

const Model = mongoose.model("Territory", schema);
module.exports = Model;
