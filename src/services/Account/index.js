const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const moment = require("moment");
const omit = require("lodash/omit");
const pick = require("lodash/pick");
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
    phoneNumberVerificationToken: { ...string },
    profileImage: { ...string, optional: true }
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
      phoneNumber: verification.phoneNumber,
      profileImage: params.profileImage
    });

    // TODO: registration successful event

    if (params.profileImage) {
      await models.PendingUpload.deleteOne({
        filename: params.profileImage
      });
    }
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

module.exports.getAccount = wrapServiceAction({
  params: {
    $$strict: "remove",
    username: { ...any }
  },
  async handler(params) {
    const account = await models.Account.findOne({
      username: params.username
    })
      .select({
        username: 1,
        email: 1,
        location: 1,
        followersCount: 1,
        followingsCount: 1,
        profileImage: 1,
        coverImage: 1
      });
    if (!account) {
      throw new ServiceError("account not found");
    }
    return account;
  }
});

module.exports.updateAccount = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    location: { ...string, optional: true },
    profileImage: { ...string, optional: true },
    coverImage: { ...string, optional: true }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }

    if (params.profileImage && account.profileImage) {
      if (params.profileImage !== account.profileImage) {
        await utils.deleteUploadedFile(account.profileImage).catch(console.error);
      }
    }
    if (params.coverImage && account.coverImage) {
      if (params.coverImage !== account.coverImage) {
        await utils.deleteUploadedFile(account.coverImage).catch(console.error);
      }
    }

    account.location = params.location;
    account.profileImage = params.profileImage || account.profileImage;
    account.coverImage = params.coverImage || account.coverImage;
    await account.save();

    await models.PendingUpload.deleteOne({
      filename: account.profileImage
    });
    await models.PendingUpload.deleteOne({
      filename: account.coverImage
    });

    return pick(account.toJSON(), ["username", "email", "profileImage", "coverImage",  "location", "followersCount", "followingsCount"]);
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

    const record = await models.AccountFollower.findOne({
      accountId: params.accountId,
      followerId: params.followerId
    });

    if (record) {
      throw new ServiceError("you are already following this account");
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


module.exports.checkAccountFollower = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    followerId: { ...any }
  },
  async handler(params) {
    const record = await models.AccountFollower.findOne({
      accountId: params.accountId,
      followerId: params.followerId
    });
    return !!record;
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

    const record = await models.AccountFollower.findOne({
      accountId: params.accountId,
      followerId: params.followerId
    });

    if (!record) {
      throw new ServiceError("you are not following this account");
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
    return models.AccountFollower.aggregate([
      { $match: { accountId: params.accountId } },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          localField: "followerId",
          foreignField: "_id",
          as: "follower",
        }
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ["$follower", 0] }
        }
      },
      {
        $project: {
          username: 1
        }
      }
    ]);
  }
});

module.exports.getAccountFollowings = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
  },
  async handler(params) {
    return models.AccountFollower.aggregate([
      { $match: { followerId: params.accountId } },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          localField: "accountId",
          foreignField: "_id",
          as: "follower",
        }
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ["$follower", 0] }
        }
      },
      {
        $project: {
          username: 1
        }
      }
    ]);
  }
});
