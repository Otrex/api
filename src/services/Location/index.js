const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

const models = require("../../db").models;
const OpenLocationCode = require("../../lib/OpenLocationCode");

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
module.exports.createLocation = wrapServiceAction({
  params: {
    ownerId: { ...any },
    ownerType: { type: "enum", values: ["account", "page"] },
    name: {
      ...string,
      min: 4
    },
    description: {
      ...string,
      min: 8
    },
    categoryId: { ...any },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    eddress: {
      ...string,
      min: 4,
      lowercase: true,
      pattern: /^[a-zA-Z0-9-_]+$/
    },
    tags: {
      type: "array",
      items: "string",
      optional: true
    },
    coordinates: {
      type: "object",
      props: {
        latitude: {
          type: "number",
          min: -90,
          max: 90
        },
        longitude: {
          type: "number",
          min: -180,
          max: 180
        }
      }
    }
  },
  async handler (params) {
    const {
      latitude,
      longitude
    } = params.coordinates;
    const location = await models.Location.findOne({
      accountId: params.accountId,
      eddress: params.eddress
    });

    if (location) {
      throw new ServiceError("you have already added a location with this eddress");
    }
    return models.Location.create({
      ownerId: params.ownerId,
      ownerType: params.ownerType,
      name: params.name,
      description: params.description,
      categoryId: params.categoryId,
      visibility: params.visibility,
      eddress: params.eddress,
      tags: params.tags,
      preciseLocation: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      plusCode: OpenLocationCode.encode(latitude, longitude)
    });
  }
});

module.exports.updateLocation = wrapServiceAction({
  params: {
    $$strict: "remove",
    locationId: { ...any },
    name: {
      ...string,
      min: 4
    },
    description: {
      ...string,
      min: 8
    },
    categoryId: { ...any },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    tags: {
      type: "array",
      items: "string"
    }
  },
  async handler (params) {
    return await models.Location.findByIdAndUpdate(params.locationId, {
      ...params
    }, { new: true });
  }
});

module.exports.getAccountLocations = wrapServiceAction({
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
    return await models.Location.find({
      ownerId: params.accountId,
      ownerType: "account",
      ...params.filter,
    }).sort({ _id: -1 }).limit(params.limit);
  }
});

module.exports.getLocationDetails = wrapServiceAction({
  params: {
    username: { ...string },
    eddress: { ...string }
  },
  async handler (params) {
    const account = await models.Account.findOne({
      username: params.username
    });
    if (!account) {
      throw new ServiceError("account not found");
    }
    return await models.Location.findOne({
      ownerId: account._id,
      eddress: params.eddress
    });
  }
});

module.exports.getAccountLocationsCount = wrapServiceAction({
  params: {
    accountId: { ...any }
  },
  async handler (params) {
    return await models.Location.countDocuments({
      accountId: params.accountId,
    });
  }
});

module.exports.getLocationCategories = wrapServiceAction({
  async handler () {
    return await models.LocationCategory.find();
  }
});
