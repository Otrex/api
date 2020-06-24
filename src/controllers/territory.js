const TerritoryService = require("../services/Territory");
const {
  successResponse
} = require("../utils");

module.exports.trackTerritory = async (req, res, next) => {
  try {
    await TerritoryService.trackTerritory({
      territoryId: req.body.territoryId,
      trackerId: req.session.account._id
    });
    return res.send(successResponse("you are now tracking this territory"));
  } catch (e) {
    next(e);
  }
};

module.exports.unTrackTerritory = async (req, res, next) => {
  try {
    await TerritoryService.unTrackTerritory({
      territoryId: req.body.territoryId,
      trackerId: req.session.account._id
    });
    return res.send(successResponse("you are no longer tracking this territory"));
  } catch (e) {
    next(e);
  }
};
