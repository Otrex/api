const express = require("express");
const router = express.Router();

const {
  register,
  login,
  initiatePasswordReset,
  completePasswordReset
} = require("../../controllers/authentication");

router.route("/register")
  .post(register);

router.route("/login")
  .post(login);

router.route("/reset-password/initiate")
  .post(initiatePasswordReset);

router.route("/reset-password/reset")
  .post(completePasswordReset);

module.exports = router;
