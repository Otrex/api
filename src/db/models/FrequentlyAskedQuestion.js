const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Model = mongoose.model("FrequentlyAskedQuestion", schema);
module.exports = Model;
