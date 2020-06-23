const AccountService = require("../services/Account");
const LocationService = require("../services/Location");
const {
  successResponse
} = require("../utils");

module.exports.getProfile = async (req, res, next) => {
  try {
    const isOwnAccount = req.params.username === req.session.account.username.toString();
    let account = await AccountService.getAccount({
      username: req.params.username || req.session.account.username
    });
    account = account.toJSON();
    if (!isOwnAccount) {
      delete account.email;
    }
    const placesCount = await LocationService.getAccountLocationsCount({
      accountId: account._id
    });
    const places = await LocationService.getAccountLocations({
      accountId: account._id,
      limit: 6,
      filters: isOwnAccount ? {} : {
        visibility: "public"
      }
    });
    return res.send(successResponse(undefined, {
      ...account,
      placesCount,
      places,
      projects: [],
      projectsCount: 0
    }));
  } catch (e) {
    next(e);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const data = await AccountService.updateAccount({
      accountId: req.session.account._id,
      location: req.body.location
    });
    return res.send(successResponse("profile updated", data));
  } catch (e) {
    next(e);
  }
};

module.exports.followAccount = async (req, res, next) => {
  try {
    const result = await AccountService.followAccount({
      ...req.body,
      followerId: req.session.account._id
    });
    console.log(result);
    return res.send(successResponse("successful"));
  } catch (e) {
    next(e);
  }
};

module.exports.unfollowAccount = async (req, res, next) => {
  try {
    await AccountService.unfollowAccount({
      ...req.body,
      followerId: req.session.account._id
    });
    return res.send(successResponse("successful"));
  } catch (e) {
    next(e);
  }
};

module.exports.getFollowers = async (req, res, next) => {
  try {
    const data = await AccountService.getAccountFollowers({
      accountId: req.params.accountId || req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.getFollowings = async (req, res, next) => {
  try {
    const data = await AccountService.getAccountFollowings({
      accountId: req.params.accountId || req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};
