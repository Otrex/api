const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  createPage,
  getPages
} = require("../../controllers/page");

router.use(verifyAccountAuth());

router.route("/")
  .get(getPages)
  .post(createPage);

module.exports = router;
