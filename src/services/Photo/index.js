const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");
const checkAuthorization = require("../_core/checkAuthorization");

const pick = require("lodash/pick");

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
module.exports.createPhotos = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    ownerId: { ...any },
    ownerType: {
      type: "enum",
      values: ["location", "project", "event"]
    },
    photos: {
      type: "array",
      min: 1,
      items: {
        type: "object",
        props: {
          filename: { ...string },
          description: {
            ...string,
            optional: true
          }
        }
      }
    }
  },
  async handler (params) {
    await checkAuthorization(params.accountId, params.ownerId, params.ownerType);
    for (const photo of params.photos) {
      await models.Photo.create({
        ...pick(params, ["accountId", "ownerId", "ownerType"]),
        ...photo
      });
      await models.PendingUpload.deleteOne({
        filename: photo.filename
      });
    }
    return true;
  }
});

module.exports.getPhotos = wrapServiceAction({
  params: {
    $$strict: "remove",
    ownerId: { ...any },
    ownerType: {
      type: "enum",
      values: ["location", "project", "event"]
    }
  },
  async handler (params) {
    return await models.Photo.find({
      ...params
    });
  }
});

module.exports.deletePhoto = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    photoId: { ...any }
  },
  async handler (params) {
    const photo = await models.Photo.findById(params.photoId);
    if (!photo) {
      throw new ServiceError("photo not found");
    }
    await checkAuthorization(params.accountId, photo.ownerId, photo.ownerType);
    await utils.deleteUploadedFile(photo.filename).catch(console.error);
    await photo.delete();
    return true;
  }
});
