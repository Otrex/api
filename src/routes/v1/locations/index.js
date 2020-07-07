const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  createLocation,
  getAccountLocations,
  getLocationDetails,
  getLocationsCategories,
  updateLocation,
  createLocationAlarm,
  getLocationAlarms
} = require("../../../controllers/location");

router.use(verifyAccountAuth());

router.route("/")
  .get(getAccountLocations)
  .post(createLocation);

router.route("/:username/:eddress")
  .get(getLocationDetails);

router.route("/:locationId/update")
  .post(updateLocation);

router.route("/categories")
  .get(getLocationsCategories);

router.route("/alarms")
  .get(getLocationAlarms);

router.route("/alarms")
  .post(createLocationAlarm);

module.exports = router;
