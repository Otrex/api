const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  populateContacts,
  getContacts,
  blockContact,
  unblockContact
} = require("../../../controllers/contact");

router.use(verifyAccountAuth());

router.route("/")
  .post(populateContacts)
  .get(getContacts);

router.route("/:contactId/block")
  .post(blockContact);

router.route("/:contactId/unblock")
  .post(unblockContact);

module.exports = router;
