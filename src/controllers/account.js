const AccountService = require("../services/Account");
const LocationService = require("../services/Location");
const {
  successResponse
} = require("../utils");

module.exports.getProfile = async (req, res, next) => {
  try {
    const is3rdPartyAccount = req.params.username &&
      (req.params.username !== req.session.account.username);

    let account = await AccountService.getAccount({
      username: req.params.username || req.session.account.username
    });
    account = account.toJSON();

    let isFollowing;
    if (is3rdPartyAccount) {
      isFollowing = await AccountService.checkAccountFollower({
        accountId: account._id,
        followerId: req.session.account._id
      });
      delete account.email;
    }
    const placesCount = await LocationService.getAccountLocationsCount({
      accountId: account._id
    });
    const places = await LocationService.getAccountLocations({
      accountId: account._id,
      limit: 6,
      filters: is3rdPartyAccount ? {
        visibility: "public"
      } : {}
    });
    return res.send(successResponse(undefined, {
      ...account,
      isFollowing,
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
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("profile updated", data));
  } catch (e) {
    next(e);
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    await AccountService.changeAccountPassword({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("password changed"));
  } catch (e) {
    next(e);
  }
};

module.exports.followAccount = async (req, res, next) => {
  try {
    await AccountService.followAccount({
      accountId: req.params.accountId || req.body.accountId,
      followerId: req.session.account._id
    });
    return res.send(successResponse("successful"));
  } catch (e) {
    next(e);
  }
};

module.exports.unfollowAccount = async (req, res, next) => {
  try {
    await AccountService.unfollowAccount({
      accountId: req.params.accountId || req.body.accountId,
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
