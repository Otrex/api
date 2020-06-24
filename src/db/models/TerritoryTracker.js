const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  territoryId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  trackerId: {
    type: mongoose.Types.ObjectId,
    required: true
  }
}, { timestamps: true });

schema.index({ territoryId: 1, trackerId: 1 });

const Model = mongoose.model("TerritoryTracker", schema);
module.exports = Model;
