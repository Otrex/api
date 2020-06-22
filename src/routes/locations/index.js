const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  createLocation
} = require("../../controllers/location");

router.use(verifyAccountAuth());

router.route("/")
  .post(createLocation);

module.exports = router;
