const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const moment = require("moment");
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
    $$strict: "remove",
    email: { ...email },
    username: {
      ...string,
      min: 4,
      max: 16,
      lowercase: true,
      pattern: /^[a-z0-9]+$/
    },
    password: { ...string, min: 6 },
    countryCode: { ...string, length: 2 },
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
      const match = item.email === params.email ? "email" : "username";
      throw new ServiceError(`an account with this ${match} already exists`);
    }
    const verification = await PhoneVerification.checkVerificationToken({
      countryCode: params.countryCode,
      phoneNumber: params.phoneNumber,
      verificationToken: params.phoneNumberVerificationToken
    });

    const account = await models.Account.create({
      email: params.email,
      username: params.username,
      password: await utils.bcryptHash(params.password),
      countryCode: params.countryCode,
      phoneNumber: verification.phoneNumber
    });
    // TODO: registration successful event
    console.log(account._id);
    return account;
  }
});

module.exports.createLoginSession = wrapServiceAction({
  params: {
    $$strict: "remove",
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
    $$strict: "remove",
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

module.exports.sendResetPasswordToken = wrapServiceAction({
  params: {
    $$strict: "remove",
    email: { ...email }
  },
  async handler(params) {
    const account = await models.Account.findOne({
      email: params.email
    });
    if (!account) {
      return false;
    }
    const resetToken = utils.generateRandomCode(32);
    await models.PasswordReset.create({
      accountId: account._id,
      resetToken,
      resetTokenExpiresAt: moment().add(1, "h")
    });
    // TODO: send the mail
    return true;
  }
});

module.exports.resetAccountPassword = wrapServiceAction({
  params: {
    $$strict: "remove",
    resetToken: { ...string },
    password: { ...string, min: 6 }
  },
  async handler(params) {
    const reset = await models.PasswordReset.findOne({
      resetToken: params.resetToken
    });
    if (!reset) {
      throw new ServiceError("reset token is invalid");
    }
    if (moment().isAfter(reset.resetTokenExpiresAt)) {
      throw new ServiceError("reset token has expired");
    }
    const account = await models.Account.findById(reset.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    account.password = await utils.bcryptHash(params.password);
    await account.save();
    return true;
  }
});

module.exports.followAccount = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    followerId: { ...any }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    const follower = await models.Account.findById(params.followerId);
    if (!account || !follower) {
      throw new ServiceError("account not found");
    }

    if (account._id.equals(follower._id)) {
      throw new ServiceError("you cannot follow yourself");
    }

    account.followersCount++;
    follower.followingsCount++;

    await Promise.all([
      account.save(),
      follower.save()
    ]);

    return await models.AccountFollower.findOneAndUpdate({
      accountId: params.accountId,
      followerId: params.followerId
    }, {}, { upsert: true, new: true });
  }
});

module.exports.unfollowAccount = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    followerId: { ...any }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    const follower = await models.Account.findById(params.followerId);
    if (!account || !follower) {
      throw new ServiceError("account not found");
    }

    if (account._id.equals(follower._id)) {
      throw new ServiceError("you cannot unfollow yourself");
    }

    account.followersCount--;
    follower.followingsCount--;

    await Promise.all([
      account.save(),
      follower.save()
    ]);
    return await models.AccountFollower.findOneAndDelete({
      accountId: params.accountId,
      followerId: params.followerId
    });
  }
});

module.exports.getAccountFollowers = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any }
  },
  async handler(params) {
    const followers = await models.AccountFollower.find({
      accountId: params.accountId
    }).populate({
      path: "followerId",
      select: "username"
    }).exec();
    return followers;
  }
});

module.exports.getAccountFollowings = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
  },
  async handler(params) {
    const followings = models.AccountFollower.find({
      followerId: params.accountId
    }).populate({
      path: "accountId",
      select: "username"
    }).exec();
    return followings;
  }
});
