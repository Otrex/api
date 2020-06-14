const AccountService = require("../services/Account");
const {
  successResponse
} = require("../utils");

module.exports.followAccount = async (req, res, next) => {
  try {
    await AccountService.followAccount({
      ...req.body,
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
    return res.send(successResponse("successful", data));
  } catch (e) {
    next(e);
  }
};

module.exports.getFollowings = async (req, res, next) => {
  try {
    const data = await AccountService.getAccountFollowings({
      accountId: req.params.accountId || req.session.account._id
    });
    return res.send(successResponse("successful", data));
  } catch (e) {
    next(e);
  }
};
