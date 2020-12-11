const mongoose = require("mongoose");
const { Schema } = mongoose;

const AssignedObject = new Schema({
  objectType: {
    type: String,
    required: true
  },
  objectPath: {
    type: String,
    required: true
  }
});

const TeamMember = new Schema({
  accountId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["owner", "maintainer"],
    required: true
  },
  assignedObjects: [AssignedObject]
}, { timestamps: true });

const schema = new Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true
  },
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
  followersCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
  },
  coverImage: {
    type: String,
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
  contactEmails: [
    {
      type: String
    }
  ],
  teamMembers: [TeamMember],
  status: {
    type: String,
    default: "active"
  }
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
