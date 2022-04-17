const mongoose = require("mongoose");

// Question Fields
// createdBy
// topic
// question
// limit (in seconds)
// marks
// testCases
// createdAt

const questionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide user!"],
    ref: "user",
  },

  topic: {
    type: String,
    required: [true, "Please provide topic name"],
  },

  question: {
    type: String,
    required: [true, "Please provide question"],
  },

  limit: {
    type: Number,
    required: [true, "Please provide question limit"],
  },

  marks: {
    type: Number,
    required: [true, "Please provide question marks"],
  },

  testCases: new mongoose.Schema({
    inp1: {
      type: String,
      required: [true, "Please provide input for test case 1"],
    },
    inp2: {
      type: String,
      required: [true, "Please provide input for test case 2"],
    },
    out1: {
      type: String,
      required: [true, "Please provide output for test case 1"],
    },
    out2: {
      type: String,
      required: [true, "Please provide output for test case 2"],
    },
  }),

  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

const Question = new mongoose.model("question", questionSchema);

module.exports = Question;
