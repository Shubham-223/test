const fetch = require("node-fetch");
const Test = require("../models/test");
const Question = require("../models/question");
const User = require("../models/user");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

exports.test = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.body.id }).populate("questions");
    return res.status(200).json(test);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.add_test = async (req, res) => {
  if (req.user.role === "company") {
    const { title, startAt, endAt, questions } = req.body;
    if (!title || !startAt || !endAt || !questions) {
      return res
        .status(400)
        .json({ success: false, error: "Please enter all the details!" });
    }
    try {
      // Channel Name
      const chnlName = `${title}_${Date.now()}`;
      const curTime = Math.floor(Date.now() / 1000);
      const expireTime = 86400;
      const agoraToken = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        chnlName,
        0,
        RtcRole.SUBSCRIBER,
        curTime + expireTime
      );
      await Test.create({
        createdBy: req.user.id,
        title,
        channelName: chnlName,
        agoraToken: agoraToken,
        startAt,
        endAt,
        questions,
      });
      return res.status(201).json({ success: true, error: null });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(500).json({ success: false, error: "invalid user!" });
  }
};

exports.all_tests = async (req, res) => {
  try {
    const tests = await Test.find({}).populate("questions");
    return res.status(200).json(tests);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.my_tests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user.id }).populate(
      "questions"
    );
    return res.status(200).json(tests);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const users = await User.find({
      results: { $elemMatch: { testId: req.body.testId } },
    }).populate("results.testId");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.tests_history = async (req, res) => {
  if (req.user.role === "user") {
    try {
      const user = await User.findOne({
        _id: req.user.id,
      }).populate("results.testId");
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(500).json({ success: false, error: "invalid user!" });
  }
};

exports.register_test = async (req, res) => {
  if (req.user.role === "user") {
    const { testId, marks } = req.body;
    try {
      const user = await User.findOne({
        _id: req.user.id,
        results: { $elemMatch: { testId: testId } },
      });
      if (!user) {
        await User.updateOne(
          { _id: req.user.id },
          {
            $addToSet: { results: { testId, marks: marks } },
          }
        );
        return res.status(201).json({ success: true, error: null });
      } else {
        return res
          .status(500)
          .json({ success: false, error: "already registered!" });
      }
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(500).json({ success: false, error: "invalid user!" });
  }
};

exports.question = async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.body.id });
    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.add_question = async (req, res) => {
  if (req.user.role === "company") {
    const { topic, question, limit, marks, testCases } = req.body;
    const { inp1, inp2, out1, out2 } = testCases;
    if (
      !topic ||
      !question ||
      !limit ||
      !marks ||
      !inp1 ||
      !out1 ||
      !inp2 ||
      !out2
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Please enter all the details!" });
    }
    try {
      await Question.create({
        createdBy: req.user.id,
        topic,
        question,
        limit,
        marks,
        testCases,
      });
      return res.status(201).json({ success: true, error: null });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(500).json({ success: false, error: "invalid user!" });
  }
};

exports.submit_question = async (req, res) => {
  if (req.user.role === "user") {
    const { script, language, versionIndex, questionId, testId } = req.body;
    try {
      const question = await Question.findOne({ _id: questionId });
      const testCases = question.testCases;

      const body1 = {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        script: script,
        stdin: testCases.inp1,
        language: language,
        versionIndex: versionIndex,
      };
      const body2 = {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        script: script,
        stdin: testCases.inp2,
        language: language,
        versionIndex: versionIndex,
      };

      const testCase1Response = await fetch(
        "https://api.jdoodle.com/v1/execute",
        {
          method: "post",
          body: JSON.stringify(body1),
          headers: { "Content-Type": "application/json" },
        }
      );
      const testCase2Response = await fetch(
        "https://api.jdoodle.com/v1/execute",
        {
          method: "post",
          body: JSON.stringify(body2),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data1 = await testCase1Response.json();
      const data2 = await testCase2Response.json();

      if (data1.error || data2.error) {
        return res.status(400).json({ success: false, error: "Wrong code!" });
      }

      if (
        data1.output.replace(/[\r\n]+/gm, "") === testCases.out1 &&
        data2.output.replace(/[\r\n]+/gm, "") === testCases.out2
      ) {
        await User.updateOne(
          {
            _id: req.user.id,
            results: { $elemMatch: { testId: testId } },
          },
          { $inc: { "results.$.marks": question.marks } }
        );
        return res.status(200).json({ success: true, error: null });
      } else {
        return res.status(400).json({ success: false, error: "Wrong code!" });
      }
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(500).json({ success: false, error: "invalid user!" });
  }
};

exports.all_questions = async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user.id });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
