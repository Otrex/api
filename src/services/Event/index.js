const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");
const checkAuthorization = require("../_core/checkAuthorization");

const utils = require("../../utils");

const models = require("../../db").models;

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
module.exports.createEvent = wrapServiceAction({
  params: {
    $$strict: "remove",
    ownerId: { ...any },
    ownerType: {
      type: "enum",
      values: ["account", "page"]
    },
    name: {
      ...string,
      min: 4
    },
    description: {
      ...string,
      min: 8
    },
    image: { ...string, optional: true },
    coverImage: { ...string, optional: true },
    time: { ...string },
    startDate: {
      type: "date"
    },
    endDate: {
      type: "date"
    },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...any }
  },
  async handler (params) {
    const event = await models.Event.create({
      ...params
    });
    if (params.image) {
      await models.PendingUpload.deleteOne({
        filename: params.image
      });
    }
    if (params.coverImage) {
      await models.PendingUpload.deleteOne({
        filename: params.coverImage
      });
    }
    return event;
  }
});

module.exports.updateEvent = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    eventId: { ...any },
    name: {
      ...string,
      min: 4
    },
    description: {
      ...string,
      min: 8
    },
    image: { ...string, optional: true },
    coverImage: { ...string, optional: true },
    time: { ...string },
    startDate: {
      type: "date"
    },
    endDate: {
      type: "date"
    },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...any }
  },
  async handler (params) {
    await checkAuthorization(params.accountId, params.eventId, "event");
    return await models.Event.findByIdAndUpdate(params.eventId, {
      ...params
    }, { new: true });
  }
  // TODO: delete coverImage and image from disk if updated
});

module.exports.getAccountEvents = wrapServiceAction({
  params: {
    accountId: { ...any },
    limit: {
      type: "number",
      default: 0
    },
    filter: {
      type: "object",
      default: {}
    }
  },
  async handler (params) {
    return await models.Event.find({
      ownerId: params.accountId,
      ownerType: "account",
      ...params.filter,
    }).sort({ _id: -1 }).limit(params.limit);
  }
});

module.exports.getPageEvents = wrapServiceAction({
  params: {
    pageId: { ...any },
    limit: {
      type: "number",
      default: 0
    },
    filter: {
      type: "object",
      default: {}
    }
  },
  async handler (params) {
    return await models.Event.find({
      ownerId: params.pageId,
      ownerType: "page",
      ...params.filter,
    }).sort({ _id: -1 }).limit(params.limit);
  }
});
