const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  createConversation,
  getConversations,
  postConversationMessage,
  getConversationMessages,
  forwardConversationMessage,
  deleteConversationMessage,
  deleteConversation
} = require("../../../controllers/conversation");

router.use(verifyAccountAuth());

router.route("/")
  .post(createConversation)
  .get(getConversations);

router.route("/:conversationId/messages")
  .post(postConversationMessage)
  .get(getConversationMessages);

router.route("/:conversationId/messages/:messageId/forward")
  .post(forwardConversationMessage);

router.route("/:conversationId/messages/:messageId/delete")
  .post(deleteConversationMessage);

router.route("/:conversationId/delete")
  .post(deleteConversation);

module.exports = router;
