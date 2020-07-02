const LocationService = require("../services/Location");
const PhotoService = require("../services/Photo");

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
    const location = await LocationService.getLocationDetails({
      username: req.params.username,
      eddress: req.params.eddress
    });
    const photos = await PhotoService.getPhotos({
      ownerId: location._id,
      ownerType: "location"
    });
    const data = {
      ...location.toJSON(),
      photos
    };
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.createLocation = async (req, res, next) => {
  try {
    const data = await LocationService.createLocation({
      ...req.body,
      ownerId: req.session.account._id,
      ownerType: "account"
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.updateLocation = async (req, res, next) => {
  try {
    const data = await LocationService.updateLocation({
      ...req.body,
      locationId: req.params.locationId
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
