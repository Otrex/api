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
const PhoneVerification = require("../PhoneVerification");

/*
* Service Actions
* */
module.exports.createAccount = wrapServiceAction({
  params: {
    $$strict: true,
    email: { ...email },
    username: {
      ...string,
      min: 4,
      max: 16,
      lowercase: true,
      pattern: /^[a-z0-9]+$/
    },
    password: { ...string, min: 6 },
    countryCode: { ...string },
    phoneNumber: { ...string, min: 9 },
    phoneNumberVerificationToken: { ...string }
  },
  async handler(params) {
    const item = await models.Account.findOne({
      $or: [
        { email: params.email },
        { username: params.username }
      ]
    });
    if (item) {
      const match = item.email === params.email ? "email" : "phone number";
      throw new ServiceError(`an account with this ${match} already exists`);
    }
    await PhoneVerification.checkVerificationToken({
      phoneNumber: params.phoneNumber,
      verificationToken: params.phoneNumberVerificationToken
    });

    const account = await models.Account.create({
      email: params.email,
      username: params.username,
      password: await utils.bcryptHash(params.password),
      countryCode: params.countryCode,
      phoneNumber: params.phoneNumber
    });
    // TODO: registration successful event
    console.log(account._id);
    return account;
  }
});

module.exports.createLoginSession = wrapServiceAction({
  params: {
    $$strict: true,
    identifier: { ...string }, // phone number or username
    password: { ...string },
    ip: { ...string, optional: true },
    userAgent: { ...string, optional: true }
  },
  async handler(params) {
    const identifierType = params.identifier.includes("+")
      ? "phone number"
      : "username";
    const AUTH_UNSUCCESSFUL = `an account with this ${identifierType} and password does not exist`;
    const account = await models.Account.findOne({
      $or: [
        { phoneNumber: params.identifier },
        { username: params.identifier }
      ]
    });
    if (!account) {
      throw new ServiceError(AUTH_UNSUCCESSFUL);
    }
    const passwordIsValid = await utils.bcryptCompare(params.password, account.password);
    if (!passwordIsValid) {
      throw new ServiceError(AUTH_UNSUCCESSFUL);
    }

    const session = await models.Session.create({
      accountId: account._id,
      token: await utils.generateJWTToken({ id: account._id.toString() }),
      ip: params.ip,
      userAgent: params.userAgent
    });

    return {
      account: omit(account.toObject(), ["password", "__v"]),
      token: session.token
    };
  }
});

module.exports.changeAccountPassword = wrapServiceAction({
  params: {
    $$strict: true,
    accountId: { ...any },
    currentPassword: { ...string },
    password: { ...string, min: 6 }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const passwordIsValid = await utils.bcryptCompare(params.currentPassword, account.password);
    if (!passwordIsValid) {
      throw new ServiceError("password is incorrect");
    }
    account.password = await utils.bcryptHash(params.password);
    await account.save();

    return true;
  }
});
