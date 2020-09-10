const express = require("express");
const router = express.Router();

const {
  getFeeds
} = require("../../../controllers/feed");

router.route("/")
  .get(getFeeds);

module.exports = router;
