const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  getQuestions
} = require("../../../controllers/faq");

router.use(verifyAccountAuth());

router.route("/")
  .get(getQuestions);

module.exports = router;
