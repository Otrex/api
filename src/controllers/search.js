const SearchService = require("../services/Search");
const {
  successResponse
} = require("../utils");

module.exports.search = async (req, res, next) => {
  try {
    const results = await SearchService.search({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, results));
  } catch (e) {
    next(e);
  }
};
