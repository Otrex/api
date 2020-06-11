const MailingListService = require("../services/MailingList");
const {
  successResponse
} = require("../utils");


module.exports.subscribeToMailingList = async (req, res, next) => {
  try {
    await MailingListService.addEmailToMailingList({
      ...req.body
    });
    return res.send(successResponse("subscription was successful"));
  } catch (e) {
    next(e);
  }
};
