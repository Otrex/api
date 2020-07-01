const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

const models = require("../../db").models;

const omit = require("lodash/omit");

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
module.exports.createPage = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    name: {
      ...string,
      min: 4
    },
    description: {
      ...string,
      min: 8
    },
    shortName: {
      ...string,
      min: 2
    },
    image: {
      ...string,
      optional: true
    },
    coverImage: {
      ...string,
      optional: true
    },
    pageType: { ...string },
    industry: { ...string },
    services: {
      type: "array",
      items: "string",
      optional: true
    },
    tags: {
      type: "array",
      items: "string",
      optional: true
    },
    streetAddress: {
      ...string,
      optional: true
    },
    contactPhoneNumbers: {
      type: "array",
      items: "string",
      optional: true
    },
    contactEmails: {
      type: "array",
      items: "string",
      optional: true
    }
  },
  async handler (params) {
    const page = await models.Page.create({
      ...omit(params, ["accountId"])
    });
    page.teamMembers.push({
      accountId: params.accountId,
      role: "owner",
      assignedObjects: [
        {
          objectType: "*",
          objectPath: "*"
        }
      ]
    });
    await page.save();

    if (params.image) {
      await models.PendingUpload.deleteOne({
        filename: params.image,
      });
    }
    if (params.coverImage) {
      await models.PendingUpload.deleteOne({
        filename: params.coverImage
      });
    }
    return true;
  }
});

module.exports.getPages = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any }
  },
  async handler (params) {
    const pages = await models.Page.find({
      "teamMembers.accountId": params.accountId
    }).select({
      teamMembers: -1
    });
    return pages;
  }
});
