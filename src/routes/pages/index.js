const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  createPage
} = require("../../controllers/page");

router.use(verifyAccountAuth());

router.route("/")
  .post(createPage);

module.exports = router;
