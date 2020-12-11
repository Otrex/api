const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  createLocation,
  getAccountLocations,
  getAccountFollowedLocations,
  getLocationDetails,
  getLocationsCategories,
  updateLocation,
  createLocationAlarm,
  getLocationAlarms,
  followLocation,
  unfollowLocation,
  getLocationFollowers
} = require("../../../controllers/location");

router.use(verifyAccountAuth());

router.route("/")
  .get(getAccountLocations)
  .post(createLocation);

router.route("/followed")
  .get(getAccountFollowedLocations);

router.route("/:locationId/update")
  .post(updateLocation);

router.route("/:locationId/follow")
  .post(followLocation);

router.route("/:locationId/unfollow")
  .post(unfollowLocation);

router.route("/:locationId/followers")
  .get(getLocationFollowers);

router.route("/:username/:eddress")
  .get(getLocationDetails);

router.route("/categories")
  .get(getLocationsCategories);

router.route("/alarms")
  .get(getLocationAlarms);

router.route("/alarms")
  .post(createLocationAlarm);

module.exports = router;
