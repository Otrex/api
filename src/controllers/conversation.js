const ChatService = require("../services/Chat");
const {
  successResponse
} = require("../utils");

module.exports.createConversation = async (req, res, next) => {
  try {
    const data = await ChatService.createConversation({
      ...req.body,
      initiatedBy: req.session.account._id
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};

module.exports.getConversations = async (req, res, next) => {
  try {
    const data = await ChatService.getConversations({
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.postConversationMessage = async (req, res, next) => {
  try {
    return res.send(successResponse(undefined, {}));
  } catch (e) {
    next(e);
  }
};

module.exports.getConversationMessages = async (req, res, next) => {
  try {
    return res.send(successResponse(undefined, {}));
  } catch (e) {
    next(e);
  }
};

module.exports.forwardConversationMessage = async (req, res, next) => {
  try {
    return res.send(successResponse(undefined, {}));
  } catch (e) {
    next(e);
  }
};

module.exports.deleteConversationMessage = async (req, res, next) => {
  try {
    return res.send(successResponse(undefined));
  } catch (e) {
    next(e);
  }
};

module.exports.deleteConversation = async (req, res, next) => {
  try {
    return res.send(successResponse(undefined));
  } catch (e) {
    next(e);
  }
};
