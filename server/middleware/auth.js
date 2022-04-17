const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = {
      id: verified.id,
      role: verified.role,
    };
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Error : ", error.message);
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = authMiddleware;
