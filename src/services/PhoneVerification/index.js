const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const Jusibe = require("jusibe");
const axios = require("axios");
const qs = require("qs");
// const jusibe = new Jusibe("18d9a4c3def23c8c24e622f17ae5a50d", "82e9c8b4200c6b4633a6ab99a9422064");
const jusibe = new Jusibe("4cdec4560f407039fa4730a87de06bfd", "852f6cb559f2eb13ee5e7e87713777a5");
const omit = require("lodash/omit");
const random = require("lodash/random");
const moment = require("moment");
const libPhoneNumber = require("google-libphonenumber");
const PNF = libPhoneNumber.PhoneNumberFormat;
const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();

const models = require("../../db").models;
const utils = require("../../utils");

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
    countryCode: { ...string, length: 2 },
    phoneNumber: { ...string, min: 9 }
  },
  async handler(params) {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(params.phoneNumber, params.countryCode);
    const formattedPhoneNumber = phoneUtil.format(phoneNumber, PNF.E164);

    const filter = {
      phoneNumber: formattedPhoneNumber
    };
    let verificationEntry = await models.Account.findOne(filter);
    if (verificationEntry) {
      throw new ServiceError("an account with this phone number already exists");
    }
    const code = random(1000, 9999);
    const updates = {
      verificationCode: code,
      verificationCodeExpiresAt: moment().add(1, "h")
    };
    verificationEntry = await models.PhoneVerification.findOneAndUpdate(omit(filter, "verifiedAt"), updates, {
      new: true,
      upsert: true
    });
    // TODO: send verification code

    // console.log(formattedPhoneNumber);
    // if (formattedPhoneNumber === "+2348165244395") {
    //   console.log("sending sms");
    try {
      const res = await axios({
        method: "post",
        url: "https://smartsmssolutions.com/api/json.php",
        data: qs.stringify({
          sender: "pointograph",
          message: "Hello, \nThanks for signing up on pointograph.com\nYour mobile number verification token is: " + code,
          to: formattedPhoneNumber,
          type: "0",
          routing: 4,
          token: "zPe3AVcD06qnWDj3SMgrdR7EjT7XD31pnEiQkPsvDgTYYEznvpBVkTVejeAdSPSbbnoJPau3282bwU4WBIKDtvdJEyCaREzOsJm7"
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8"
        }
      });
      console.log("=========>", res.data);
    } catch (e) {
      throw new ServiceError("the phone number is not valid");
    }
    // }


    // try {
    //   await jusibe.sendSMS({
    //     to: formattedPhoneNumber,
    //     from: "pointograph",
    //     message: "Hello, \nThanks for signing up on pointograph.com\nYour mobile number verification token is:" + code
    //   });
    // } catch (e) {
    //   throw new ServiceError("the phone number is not valid");
    // }

    return verificationEntry;
  }
});

module.exports.checkVerificationCode = wrapServiceAction({
  params: {
    ip: { ...string },
    countryCode: { ...string, length: 2 },
    phoneNumber: { ...string, min: 9 },
    verificationCode: { ...string }
  },
  async handler(params) {
    const CODE_NOT_VALID = "verification code is not valid";
    const CODE_EXPIRED = "verification code has expired";

    const phoneNumber = phoneUtil.parseAndKeepRawInput(params.phoneNumber, params.countryCode);
    const formattedPhoneNumber = phoneUtil.format(phoneNumber, PNF.E164);

    const filter = {
      phoneNumber: formattedPhoneNumber,
      verifiedAt: { $exists: false }
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

    if (verificationEntry.verificationCode !== params.verificationCode) {
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
    countryCode: { ...string, length: 2 },
    phoneNumber: { ...string, min: 9 },
    verificationToken: { ...string }
  },
  async handler(params) {
    const TOKEN_NOT_VALID = "verification token is not valid";

    const phoneNumber = phoneUtil.parseAndKeepRawInput(params.phoneNumber, params.countryCode);
    const formattedPhoneNumber = phoneUtil.format(phoneNumber, PNF.E164);

    const filter = {
      phoneNumber: formattedPhoneNumber,
      verificationToken: params.verificationToken,
    };
    let verificationEntry = await models.PhoneVerification.findOne(filter);
    if (!verificationEntry) {
      throw new ServiceError(TOKEN_NOT_VALID);
    }
    return verificationEntry;
  }
});
