const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const libPhoneNumber = require("google-libphonenumber");
const PNF = libPhoneNumber.PhoneNumberFormat;
const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();

const utils = require("../../utils");

const db = require("../../db");
const models = db.models;

/*
* Validation Helpers
* */
const { string, any } = require("../../validation");

/*
* Service Dependencies
* */

/*
* Service Actions
* */

module.exports.getContacts = wrapServiceAction({
  params: {
    accountId: { ...any }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    return models.Contact.aggregate([
      {
        $match: {
          accountId: db.utils.ObjectId(params.accountId),
          isBlocked: false
        }
      },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          localField: "contactId",
          foreignField: "_id",
          as: "account",
        }
      },
      {
        $set: {
          account: { $arrayElemAt: ["$account", 0] }
        }
      },
      {
        $project: {
          "isBlocked": 1,
          "account.username": 1,
          "account.phoneNumber": 1,
          "account.profileImage": 1
        }
      }
    ]);
  }
});

module.exports.populateContacts = wrapServiceAction({
  params: {
    accountId: { ...any },
    phoneNumbers: {
      type: "array",
      items: {
        ...string,
        min: 9
      }
    }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const defaultCountryCode = account.countryCode;
    for (const phoneNumber of params.phoneNumbers) {
      const isInternationalFormat = phoneNumber.includes("+");
      const parseCountryCode = isInternationalFormat ? undefined : defaultCountryCode;
      const parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(phoneNumber, parseCountryCode);
      if (!phoneUtil.isPossibleNumber(parsedPhoneNumber) || !phoneUtil.isValidNumber(parsedPhoneNumber)) {
        continue;
      }
      const formattedPhoneNumber = phoneUtil.format(parsedPhoneNumber, PNF.E164);
      const pointographAccount = await models.Account.findOne({
        phoneNumber: formattedPhoneNumber,
        _id: { $ne: account._id }
      });
      if (!pointographAccount) {
        continue;
      }
      const exists = await models.Contact.findOne({
        accountId: params.accountId,
        contactId: pointographAccount._id
      });
      if (!exists) {
        await models.Contact.create({
          accountId: params.accountId,
          contactId: pointographAccount._id
        });
      }
    }
    return await module.exports.getContacts({
      accountId: params.accountId
    });
  }
});

module.exports.blockContact = wrapServiceAction({
  params: {
    accountId: { ...any },
    contactId: { ...any }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const contact = await models.Contact.findOne({
      _id: params.contactId,
      accountId: params.accountId
    });
    if (!contact) {
      throw new ServiceError("contact not found");
    }
    if (contact.isBlocked) {
      throw new ServiceError("you have already blocked this contact");
    }
    contact.isBlocked = true;
    await contact.save();
    return true;
  }
});

module.exports.unblockContact = wrapServiceAction({
  params: {
    accountId: { ...any },
    contactId: { ...any }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const contact = await models.Contact.findOne({
      _id: params.contactId,
      accountId: params.accountId
    });
    if (!contact) {
      throw new ServiceError("contact not found");
    }
    if (!contact.isBlocked) {
      throw new ServiceError("contact is not blocked");
    }
    contact.isBlocked = false;
    await contact.save();
    return true;
  }
});
