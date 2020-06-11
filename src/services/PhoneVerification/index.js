const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const omit = require("lodash/omit");
const moment = require("moment");
const utils = require("../../utils");

const models = require("../../db").models;

/*
* Validation Helpers
* */
const { string } = require("../../validation");

/*
* Service Dependencies
* */


/*
* Service Actions
* */
module.exports.sendVerificationCode = wrapServiceAction({
  params: {
    countryCode: { ...string },
    phoneNumber: { ...string, min: 9 }
  },
  async handler(params) {
    const filter = {
      countryCode: params.countryCode,
      phoneNumber: params.phoneNumber,
      phoneNumberVerifiedAt: { $exists: true }
    };
    let verificationEntry = await models.PhoneVerification.findOne(filter);
    if (verificationEntry) {
      throw new ServiceError("an account with this phone number already exists");
    }
    const code = utils.generateRandomCode(4).toUpperCase();
    const updates = {
      verificationCode: code,
      verificationCodeExpiresAt: moment().add(1, "h")
    };
    verificationEntry = await models.PhoneVerification.findOneAndUpdate(omit(filter, "phoneNumberVerifiedAt"), updates, {
      new: true,
      upsert: true
    });
    // TODO: send verification code
    return verificationEntry;
  }
});

module.exports.checkVerificationCode = wrapServiceAction({
  params: {
    ip: { ...string },
    countryCode: { ...string },
    phoneNumber: { ...string, min: 9 },
    verificationCode: { ...string }
  },
  async handler(params) {
    const CODE_NOT_VALID = "verification code is not valid";
    const CODE_EXPIRED = "verification code has expired";

    const filter = {
      countryCode: params.countryCode,
      phoneNumber: params.phoneNumber,
      phoneNumberVerifiedAt: { $exists: false },
      verificationToken: { $exists: false }
    };
    let verificationEntry = await models.PhoneVerification.findOne(filter);
    if (!verificationEntry) {
      throw new ServiceError(CODE_NOT_VALID);
    }

    const ipAttempts = verificationEntry.verificationAttempts.reduce((count, attempt) => {
      if (attempt.ip === params.ip) { /* TODO: compare IP addresses properly */
        return ++count;
      }
    }, 0);

    if (ipAttempts > 3) {
      throw new ServiceError("verification attempts exceeded");
    }

    if (verificationEntry.verificationCode !== params.code) {
      verificationEntry.verificationAttempts.push({
        ip: params.ip
      });
      await verificationEntry.save();
      throw new ServiceError(CODE_NOT_VALID);
    }
    if (moment().isAfter(verificationEntry.verificationCodeExpiresAt)) {
      throw new ServiceError(CODE_EXPIRED);
    }
    // code is valid and has not expired
    verificationEntry.verifiedAt = moment();
    verificationEntry.verificationToken = utils.generateHash(utils.generateRandomCode(32));
    await verificationEntry.save();
    return verificationEntry;
  }
});

module.exports.checkVerificationToken = wrapServiceAction({
  params: {
    phoneNumber: { ...string, min: 9 },
    verificationToken: { ...string }
  },
  async handler(params) {
    const TOKEN_NOT_VALID = "verification token is not valid";

    const filter = {
      phoneNumber: params.phoneNumber,
      verificationToken: params.verificationToken,
    };
    let verificationEntry = await models.PhoneVerification.findOne(filter);
    if (!verificationEntry) {
      throw new ServiceError(TOKEN_NOT_VALID);
    }
    return true;
  }
});
