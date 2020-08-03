const {
  ServiceError,
  AuthorizationError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");
const checkAuthorization = require("../_core/checkAuthorization");

const utils = require("../../utils");

const db = require("../../db");
const models = db.models;

/*
* Validation Helpers
* */
const { string, objectId } = require("../../validation");

/*
* Service Dependencies
* */

/*
* Service Actions
* */
module.exports.createEvent = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...objectId },
    ownerId: { ...objectId },
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
    image: {
      ...string,
      optional: true
    },
    coverImage: {
      ...string,
      optional: true
    },
    time: { ...string },
    startDate: {
      type: "date",
      convert: true
    },
    endDate: {
      type: "date",
      convert: true
    },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...objectId },
    categoryId: { ...objectId }
  },
  async handler (params) {
    if (params.ownerType === "account" && params.ownerId.toString() !== params.accountId.toString()) {
      throw new AuthorizationError();
    }
    if (params.ownerType === "page") {
      const page = await models.Page.findById(params.ownerId);
      if (!page) {
        throw new ServiceError("page not found");
      }
      await checkAuthorization(params.accountId, params.locationId, "location");
    }
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

module.exports.getEventCategories = wrapServiceAction({
  async handler () {
    return await models.EventCategory.find();
  }
});

module.exports.updateEvent = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...objectId },
    eventId: { ...objectId },
    name: {
      ...string,
      min: 4
    },
    description: {
      ...string,
      min: 8
    },
    image: {
      ...string,
      optional: true
    },
    coverImage: {
      ...string,
      optional: true
    },
    time: { ...string },
    startDate: {
      type: "date",
      convert: true
    },
    endDate: {
      type: "date",
      convert: true
    },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...objectId },
    categoryId: { ...objectId }
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
    accountId: { ...objectId },
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
    return  models.Event.aggregate([
      {
        $match: {
          ownerId: db.utils.ObjectId(params.accountId),
          ownerType: "account",
          ...params.filters,
        },
      },
      { $sort: { _id: -1 } },
      ...(params.limit > 0 ? [{ $limit: params.limit }] : []),
      {
        $lookup: {
          from: models.Photo.collection.collectionName,
          localField: "ownerId",
          foreignField: "_id",
          as: "photos",
        }
      }
    ]);
    // return await models.Event.find({
    //   ownerId: params.accountId,
    //   ownerType: "account",
    //   ...params.filter,
    // }).sort({ _id: -1 }).limit(params.limit);
  }
});

module.exports.getPageEvents = wrapServiceAction({
  params: {
    pageId: { ...objectId },
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
