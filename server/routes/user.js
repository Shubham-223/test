const router = require("express").Router();

// Controllers
const {
  register,
  login,
  logout,
  user,
  loggedin,
  allusers,
} = require("../controllers/user");

// AuthMiddleware
const authMiddleware = require("../middleware/auth");

// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/loggedin", loggedin);
router.post("/user", authMiddleware, user);
router.post("/allusers", authMiddleware, allusers);

module.exports = router;
