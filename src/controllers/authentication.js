const AccountService = require("../services/Account");
const {
  successResponse
} = require("../utils");

module.exports.register = async (req, res, next) => {
  try {
    await AccountService.createAccount({
      ...req.body
    });
    const data = await AccountService.createLoginSession({
      identifier: req.body.username,
      password: req.body.password,
      ip: req.ip,
      userAgent: req.header("User-Agent")
    });
    return res.send(successResponse("account created successfully", data));
  } catch (e) {
    next(e);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const data = await AccountService.createLoginSession({
      ...req.body,
      ip: req.ip,
      userAgent: req.header("User-Agent")
    });
    return res.send(successResponse("login successful", data));
  } catch (e) {
    next(e);
  }
};

module.exports.initiatePasswordReset = async (req, res, next) => {
  try {
    await AccountService.sendResetPasswordToken({
      ...req.body
    });
    return res.send(successResponse("password reset link has been sent to your email"));
  } catch (e) {
    next(e);
  }
};

module.exports.completePasswordReset = async (req, res, next) => {
  try {
    await AccountService.resetAccountPassword({
      ...req.body
    });
    return res.send(successResponse("password reset successful. proceed to login"));
  } catch (e) {
    next(e);
  }
};
