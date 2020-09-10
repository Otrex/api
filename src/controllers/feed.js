const FeedService = require("../services/Feed");
const {
  successResponse
} = require("../utils");

module.exports.getFeeds = async (req, res, next) => {
  try {
    const data = await FeedService.getAccountFeeds({
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};
