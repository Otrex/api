const {
  AuthenticationError
} = require("../errors");
const utils = require("../utils");
const models = require("../db").models;

module.exports.setAccountSession = async (req, res, next) => {
  try {
    req.session = req.session || {};

    const token = req.header("x-api-token") || req.body.token;
    if (!token) {
      return next();
    }

    const { id } = await utils.decodeToken(token);
    if (!id) {
      return next(new AuthenticationError("unable to verify token"));
    }
    const [account, session] = await Promise.all([
      models.Account.findById(id),
      models.Session.findOne({ token })
    ]);
    if (!account || !session) {
      return next(new AuthenticationError("token is invalid"));
    }
    req.session.account = account;
    next();
  } catch (e) {
    switch (e.name) {
    case "TokenExpiredError":
      return next(new AuthenticationError("token has expired"));
    case "JsonWebTokenError":
      return next(new AuthenticationError(e.message));
    case "NotBeforeError":
      return next(new AuthenticationError(e.message));
    default:
      return next(e);
    }
  }
};

module.exports.verifyAccountAuth = (roles = []) => {
  const validRoles = ["*"];
  if (roles.some((type) => !validRoles.includes(type))) {
    throw new Error("invalid role passed to middleware constructor");
  }
  return (req, res, next) => {
    try {
      const account = req.session.account;
      if (!account) {
        return next(new AuthenticationError("you need to be authenticated to access this endpoint"));
      }
      next();
    } catch (e) {
      next(e);
    }
  };
};
