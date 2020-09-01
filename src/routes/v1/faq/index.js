const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  getQuestions,
  addQuestion
} = require("../../../controllers/faq");

router.use(verifyAccountAuth());

router.route("/")
  .post(addQuestion)
  .get(getQuestions);

module.exports = router;
