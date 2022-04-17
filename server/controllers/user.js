const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, error: "User with email already exists!" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      results: [],
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + 5);

    return res
      .cookie("token", token, { httpOnly: true, expires: expireTime })
      .status(201)
      .json({ success: true, error: null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please enter all the details!" });
  }

  try {
    const existingUser = await User.findOne({ email }).select(
      "passwordHash role status"
    );
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password!" });
    }

    const passCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!passCorrect) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password!" });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
      },
      process.env.JWT_SECRET
    );

    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + 5);

    return res
      .cookie("token", token, { httpOnly: true, expires: expireTime })
      .status(201)
      .json({ success: true, error: null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.logout = (req, res) => {
  return res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .status(200)
    .json({ success: true, error: null });
};

exports.user = async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  if (!user) {
    return res.status(200).json({ success: false, error: "No user found" });
  }
  return res.status(200).json(user);
};

exports.loggedin = (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.send(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.send(false);
    }
    return res.send(true);
  } catch (error) {
    console.log("Loggedin Error : ", error.message);
    return res.send(false);
  }
};

exports.allusers = async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } });
  return res.status(200).json(users);
};
