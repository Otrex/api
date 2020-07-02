const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

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
module.exports.createPhoto = wrapServiceAction({
  params: {
    $$strict: "remove",
    ownerId: { ...any },
    ownerType: {
      type: "enum",
      values: ["location", "project", "event"]
    },
    filename: { ...string },
    description: { ...string, optional: true }
  },
  async handler (params) {
    const photo = await models.Photo.create({
      ...params
    });
    await models.PendingUpload.deleteOne({
      filename: params.filename
    });
    return photo;
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
    photoId: { ...any }
  },
  async handler (params) {
    const photo = await models.Photo.findById(params.photoId);
    if (!photo) {
      throw new ServiceError("photo not found");
    }
    await utils.deleteUploadedFile(photo.filename).catch(console.error);
    await photo.delete();
    return true;
  }
});
