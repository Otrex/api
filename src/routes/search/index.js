const express = require("express");
const router = express.Router();

const {
  search
} = require("../../controllers/search");

router.route("/")
  .post(search);

module.exports = router;
