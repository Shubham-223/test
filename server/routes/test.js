const router = require("express").Router();

// Controllers
const {
  test,
  add_test,
  all_tests,
  question,
  add_question,
  all_questions,
  register_test,
  submit_question,
  tests_history,
  my_tests,
  getRecords,
} = require("../controllers/test");

// AuthMiddleware
const authMiddleware = require("../middleware/auth");

// Routes
router.post("/test", authMiddleware, test);
router.post("/add_test", authMiddleware, add_test);
router.post("/all_tests", authMiddleware, all_tests);
router.post("/question", authMiddleware, question);
router.post("/add_question", authMiddleware, add_question);
router.post("/all_questions", authMiddleware, all_questions);
router.post("/register_test", authMiddleware, register_test);
router.post("/submit_question", authMiddleware, submit_question);
router.post("/tests_history", authMiddleware, tests_history);
router.post("/my_tests", authMiddleware, my_tests);
router.post("/getRecords", authMiddleware, getRecords);

module.exports = router;
