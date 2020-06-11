const AccountService = require("../services/Account");
const {
  successResponse
} = require("../utils");

module.exports.register = async (req, res, next) => {
  try {
    await AccountService.createAccount({
      ...req.body
    });
    return res.send(successResponse("account created successfully"));
  } catch (e) {
    next(e);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    return res.send(successResponse("not implemented"));
  } catch (e) {
    next(e);
  }
};
