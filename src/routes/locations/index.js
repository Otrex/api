const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  createLocation,
  getAccountLocations,
  getLocationDetails
} = require("../../controllers/location");

router.use(verifyAccountAuth());

router.route("/")
  .post(createLocation);

router.route("/")
  .get(getAccountLocations);

router.route("/:username/:eddress")
  .get(getLocationDetails);

module.exports = router;
