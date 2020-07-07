const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  search
} = require("../../../controllers/search");

router.use(verifyAccountAuth());

router.route("/")
  .post(search);

module.exports = router;
