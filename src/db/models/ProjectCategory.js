const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

schema.index({ name: 1 });

const Model = mongoose.model("ProjectCategory", schema);
module.exports = Model;
