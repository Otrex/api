const express = require("express");
const router = express.Router();

const {
  createLocation
} = require("../../controllers/location");

router.route("/")
  .post(createLocation);

module.exports = router;
