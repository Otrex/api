const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  locationId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  followerId: {
    type: mongoose.Types.ObjectId,
    required: true
  }
}, { timestamps: true });

schema.index({ locationId: 1, followerId: 1 });

const Model = mongoose.model("LocationFollower", schema);
module.exports = Model;
