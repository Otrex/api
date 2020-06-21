const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  },
  pageType: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  services: [
    {
      type: String,
      required: true
    }
  ],
  tags: [
    {
      type: String,
      required: true
    }
  ],
  streetAddress: {
    type: String
  },
  contactPhoneNumbers: [
    {
      type: String
    }
  ],
  contactEmail: [
    {
      type: String
    }
  ]
}, { timestamps: true });

schema.index({
  name: "text",
  description: "text",
  industry: "text",
  services: "text",
  tags: "text"
}, {
  weights: {
    name: 20,
    description: 10,
    industry: 5,
    services: 2,
    tags: 1
  }
});

const Model = mongoose.model("Page", schema);
module.exports = Model;
