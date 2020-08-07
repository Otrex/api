const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  addEvent,
  getSingleEvent,
  updateEvent,
  getEventCategories
} = require("../../../controllers/event");

router.use(verifyAccountAuth());

router.route("/")
  .post(addEvent);

router.route("/categories")
  .get(getEventCategories);

router.route("/:eventId")
  .get(getSingleEvent);

router.route("/:eventId/update")
  .post(updateEvent);

module.exports = router;
