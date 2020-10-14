const LocationService = require("../services/Location");
const PhotoService = require("../services/Photo");
const ProjectService = require("../services/Project");
const EventService = require("../services/Event");

const {
  successResponse,
  errorResponse
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
    if (!location) {
      return res.send(errorResponse("location not found"));
    }
    const photos = await PhotoService.getPhotos({
      ownerId: location._id,
      ownerType: "location"
    });
    const projects = await ProjectService.getAccountProjects({
      accountId: req.session.account._id,
      filters: {
        locationId: location._id,
      }
    });
    const events = await EventService.getAccountEvents({
      accountId: req.session.account._id,
      filters: {
        locationId: location._id,
      }
    });
    const data = {
      ...location.toJSON(),
      photos,
      projects,
      events
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
      accountId: req.session.account._id,
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

module.exports.createLocationAlarm = async (req, res, next) => {
  try {
    const data = await LocationService.createLocationAlarm({
      accountId: req.session.account._id,
      locationId: req.body.locationId,
      description: req.body.description
    });
    return res.send(successResponse("alarm created", data));
  } catch (e) {
    next(e);
  }
};

module.exports.getLocationAlarms = async (req, res, next) => {
  try {
    const data = await LocationService.getAccountLocationAlarms({
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.followLocation = async (req, res, next) => {
  try {
    await LocationService.followLocation({
      locationId: req.params.locationId,
      followerId: req.session.account._id
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.unfollowLocation = async (req, res, next) => {
  try {
    await LocationService.unfollowLocation({
      locationId: req.params.locationId,
      followerId: req.session.account._id
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.getLocationFollowers = async (req, res, next) => {
  try {
    const data = await LocationService.getLocationFollowers({
      locationId: req.params.locationId
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};
