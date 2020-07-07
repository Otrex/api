const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema({
  pageId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  inviteeEmail: {
    type: String,
    required: true
  },
  inviteToken: {
    type: String,
    required: true,
    unique: true
  },
  assignedObjects: [
    {
      objectType: String,
      objectPath: String
    }
  ],
  inviteStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

const Model = mongoose.model("PageTeamMemberInvitation", schema);
module.exports = Model;
