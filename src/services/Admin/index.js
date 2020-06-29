const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const omit = require("lodash/omit");
const utils = require("../../utils");

const models = require("../../db").models;

/*
* Validation Helpers
* */
const {
  any,
  string,
  email
} = require("../../validation");

/*
* Service Dependencies
* */

/*
* Service Actions
* */
module.exports.createLoginSession = wrapServiceAction({
  params: {
    $$strict: "remove",
    email: { ...email },
    password: { ...string },
    ip: { ...string, optional: true },
    userAgent: { ...string, optional: true }
  },
  async handler(params) {
    const AUTH_UNSUCCESSFUL = "an account with this email and password does not exist";
    const admin = await models.Admin.findOne({ email: params.email },);
    if (!admin) {
      throw new ServiceError(AUTH_UNSUCCESSFUL);
    }
    const passwordIsValid = await utils.bcryptCompare(params.password, admin.password);
    if (!passwordIsValid) {
      throw new ServiceError(AUTH_UNSUCCESSFUL);
    }

    const session = await models.AdminSession.create({
      adminId: admin._id,
      token: await utils.generateJWTToken({ id: admin._id.toString() }),
      ip: params.ip,
      userAgent: params.userAgent
    });

    return {
      account: omit(admin.toObject(), ["password", "__v"]),
      token: session.token
    };
  }
});

module.exports.getAccounts = wrapServiceAction({
  async handler() {
    return await models.Account.find()
      .select({
        username: 1,
        email: 1,
        location: 1,
        followersCount: 1,
        followingsCount: 1,
        profileImage: 1,
        coverImage: 1
      });
  }
});

module.exports.activateAccount = wrapServiceAction({
  params: {
    id: { ...any }
  },
  async handler(params) {
    const account = await models.Account.findById(params.id);
    if (!account) {
      throw new ServiceError("account not found");
    }
    account.status = "active";
    await account.save();
  }
});

module.exports.deactivateAccount = wrapServiceAction({
  params: {
    id: { ...any }
  },
  async handler(params) {
    const account = await models.Account.findById(params.id);
    if (!account) {
      throw new ServiceError("account not found");
    }
    account.status = "inactive";
    await account.save();
  }
});

module.exports.getLocations = wrapServiceAction({
  async handler() {
    return await models.Location.find();
  }
});

module.exports.getPages = wrapServiceAction({
  async handler() {
    return await models.Page.find();
  }
});
