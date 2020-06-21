const LocationService = require("../services/Location");
const {
  successResponse
} = require("../utils");

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
