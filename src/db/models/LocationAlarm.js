const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  locationId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    default: "active"
  }
}, { timestamps: true });

schema.index({ accountId: 1, locationId: 1 });

const Model = mongoose.model("LocationAlarm", schema);
module.exports = Model;
