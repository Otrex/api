const PhoneVerificationService = require("../services/PhoneVerification");
const {
  successResponse
} = require("../utils");

module.exports.sendPhoneVerificationCode = async (req, res, next) => {
  try {
    await PhoneVerificationService.sendVerificationCode({
      ...req.body
    });
    return res.send(successResponse("verification code has been sent"));
  } catch (e) {
    next(e);
  }
};

module.exports.checkPhoneVerificationCode = async (req, res, next) => {
  try {
    await PhoneVerificationService.checkVerificationCode({
      ...req.body
    });
    return res.send(successResponse("verification code has been verified"));
  } catch (e) {
    next(e);
  }
};
