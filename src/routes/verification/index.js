const express = require("express");
const router = express.Router();

const {
  sendPhoneVerificationCode,
  checkPhoneVerificationCode
} = require("../../controllers/verification");

router.route("/phone/send")
  .post(sendPhoneVerificationCode);

router.route("/phone/check")
  .post(checkPhoneVerificationCode);

module.exports = router;
