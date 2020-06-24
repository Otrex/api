const LocationService = require("../services/Location");
const {
  successResponse
} = require("../utils");

module.exports.getAccountLocations = async (req, res, next) => {
  try {
    const data = await LocationService.getAccountLocations({
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.getLocationDetails = async (req, res, next) => {
  try {
    const data = await LocationService.getLocationDetails({
      username: req.params.username,
      eddress: req.params.eddress
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.createLocation = async (req, res, next) => {
  try {
    const data = await LocationService.createLocation({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.getLocationsCategories = async (req, res, next) => {
  try {
    const data = await LocationService.getLocationCategories();
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};
