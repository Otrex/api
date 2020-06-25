const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  filename: {
    type: String,
    required: true
  }
}, { timestamps: true });

schema.index({
  filename: 1
});

const Model = mongoose.model("PendingUpload", schema);
module.exports = Model;
