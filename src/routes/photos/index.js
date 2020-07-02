const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  addPhoto,
  deletePhoto
} = require("../../controllers/photo");

router.use(verifyAccountAuth());

// TODO: check policies
router.route("/")
  .post(addPhoto);

router.route("/:photoId/delete")
  .post(deletePhoto);

module.exports = router;
