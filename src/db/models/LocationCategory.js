const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("LocationCategory", schema);
module.exports = Model;
