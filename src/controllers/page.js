const PageService = require("../services/Page");
const {
  successResponse
} = require("../utils");

module.exports.createPage = async (req, res, next) => {
  try {
    await PageService.createPage({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};
