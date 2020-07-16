const ChatService = require("../services/Chat");
const {
  successResponse
} = require("../utils");

module.exports.populateContacts = async (req, res, next) => {
  try {
    const data = await ChatService.populateContacts({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};

module.exports.getContacts = async (req, res, next) => {
  try {
    const data = await ChatService.getContacts({
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.blockContact = async (req, res, next) => {
  try {
    await ChatService.blockContact({
      accountId: req.session.account._id,
      contactId: req.params.contactId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.unblockContact = async (req, res, next) => {
  try {
    await ChatService.unblockContact({
      accountId: req.session.account._id,
      contactId: req.params.contactId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};
