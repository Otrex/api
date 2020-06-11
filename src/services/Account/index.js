const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

const models = require("../../db").models;

/*
* Validation Helpers
* */
const { string } = require("../../validation");
const { email } = require("../../validation");

/*
* Service Dependencies
* */
const PhoneVerification = require("../PhoneVerification");

/*
* Service Actions
* */
module.exports.createAccount = wrapServiceAction({
  params: {
    email: { ...email },
    username: {
      ...string,
      min: 4,
      max: 16,
      lowercase: true,
      pattern: /^[a-z0-9]+$/
    },
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
      countryCode: params.countryCode,
      phoneNumber: params.phoneNumber
    });
    // TODO: registration successful event
    console.log(account._id);
    return account;
  }
});
