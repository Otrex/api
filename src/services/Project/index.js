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
module.exports.createProject = wrapServiceAction({
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
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...any },
    categoryId: { ...any }
  },
  async handler (params) {
    const event = await models.Project.create({
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

module.exports.updateProject = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    projectId: { ...any },
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
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...any },
    categoryId: { ...any }
  },
  async handler (params) {
    await checkAuthorization(params.accountId, params.eventId, "event");
    return await models.Project.findByIdAndUpdate(params.eventId, {
      ...params
    }, { new: true });
    // TODO: delete coverImage and image from disk if updated
  }
});
