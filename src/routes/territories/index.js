const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  trackTerritory,
  unTrackTerritory,
  getTerritoryDetails
} = require("../../controllers/territory");

router.use(verifyAccountAuth());

router.route("/:territoryId")
  .get(getTerritoryDetails);

router.route("/track")
  .post(trackTerritory);

router.route("/untrack")
  .post(unTrackTerritory);

module.exports = router;
