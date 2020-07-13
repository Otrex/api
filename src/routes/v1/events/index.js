const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  addEvent,
  updateEvent
} = require("../../../controllers/event");

router.use(verifyAccountAuth());

router.route("/")
  .post(addEvent);

router.route("/:eventId/update")
  .post(updateEvent);

module.exports = router;
