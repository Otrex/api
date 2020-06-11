const express = require("express");
const router = express.Router();

const {
  subscribeToMailingList
} = require("../../controllers/mailingList");

router.route("/subscribe")
  .post(subscribeToMailingList);

module.exports = router;
