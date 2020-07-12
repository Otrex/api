const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  getTerritories,
  createTerritory,
  trackTerritory,
  unTrackTerritory,
  getTerritoryDetails
} = require("../../../controllers/territory");

router.use(verifyAccountAuth());

router.route("/")
  .get(getTerritories)
  .post(createTerritory);

router.route("/:territoryId")
  .get(getTerritoryDetails);

router.route("/:territoryId?/track")
  .post(trackTerritory);

router.route("/:territoryId?/untrack")
  .post(unTrackTerritory);

module.exports = router;
