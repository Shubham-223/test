const mongoose = require("mongoose");

// Test Fields
// createdBy
// title
// startAt
// endAt
// questions
// createdAt

const testSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide user!"],
    ref: "user",
  },

  title: {
    type: String,
    required: [true, "Please provide test title"],
  },

  channelName: {
    type: String,
    required: [true, "Please provide channel name"],
  },

  agoraToken: {
    type: String,
    required: [true, "Please provide agora token"],
  },

  startAt: {
    type: Number,
    required: [true, "Please provide start time"],
  },

  endAt: {
    type: Number,
    required: [true, "Please provide end time"],
  },

  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
      required: [true, "Please provide questions for the test"],
    },
  ],

  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

const Test = new mongoose.model("test", testSchema);

module.exports = Test;
