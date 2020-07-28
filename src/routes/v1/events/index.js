const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  addEvent,
  updateEvent,
  getEventCategories
} = require("../../../controllers/event");

router.use(verifyAccountAuth());

router.route("/")
  .post(addEvent);

router.route("/:eventId/update")
  .post(updateEvent);

router.route("/categories")
  .get(getEventCategories);

module.exports = router;
