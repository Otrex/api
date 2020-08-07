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
const { string, any, objectId } = require("../../validation");

/*
* Service Dependencies
* */

/*
* Service Actions
* */
module.exports.getProjectCategories = wrapServiceAction({
  async handler () {
    return await models.ProjectCategory.find();
  }
});

module.exports.createProject = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
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
    image: {
      ...string,
      optional: true
    },
    coverImage: {
      ...string,
      optional: true
    },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...any },
    categoryId: { ...any }
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

module.exports.getProject = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    projectId: { ...any }
  },
  async handler (params) {
    await checkAuthorization(params.accountId, params.projectId, "project");
    const project = await models.Project.findById(params.projectId);
    const category = await models.ProjectCategory.findById(project.categoryId);
    const location = await models.Location.findById(project.locationId);
    return {
      ...project.toJSON(),
      category,
      location
    };
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
    image: {
      ...string,
      optional: true
    },
    coverImage: {
      ...string,
      optional: true
    },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    locationId: { ...any },
    categoryId: { ...any }
  },
  async handler (params) {
    await checkAuthorization(params.accountId, params.projectId, "project");
    return await models.Project.findByIdAndUpdate(params.projectId, {
      ...params
    }, { new: true });
    // TODO: delete coverImage and image from disk if updated
  }
});

module.exports.getAccountProjectsCount = wrapServiceAction({
  params: {
    accountId: { ...any },
    filters: {
      type: "object",
      default: {}
    }
  },
  async handler (params) {
    return await models.Project.countDocuments({
      ownerId: params.accountId,
      ownerType: "account",
      ...params.filters
    });
  }
});

module.exports.getAccountProjects = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    limit: {
      type: "number",
      default: 0
    },
    filters: {
      type: "object",
      default: {}
    }
  },
  async handler (params) {
    return models.Project.aggregate([
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
          localField: "_id",
          foreignField: "ownerId",
          as: "photos",
        }
      },
    ]);
  }
});

