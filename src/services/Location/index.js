const {
  ServiceError,
  AuthorizationError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");
const checkAuthorization = require("../_core/checkAuthorization");

const utils = require("../../utils");

const ObjectId = require("mongoose").Types.ObjectId;

const db = require("../../db");
const models = db.models;
const OpenLocationCode = require("../../lib/OpenLocationCode");

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
module.exports.createLocation = wrapServiceAction({
  params: {
    ownerId: { ...any },
    ownerType: {
      type: "enum",
      values: ["account", "page"]
    },
    name: {
      ...string,
      min: 4,
      messages: {
        stringMin: "description should be more than 3 characters"
      }
    },
    description: {
      ...string,
      min: 8,
      messages: {
        stringMin: "description should be more than 8 characters"
      }
    },
    categoryId: { ...any },
    visibility: {
      type: "enum",
      values: ["public", "private"]
    },
    eddress: {
      ...string,
      min: 4,
      max: 32,
      lowercase: true,
      pattern: /^[a-zA-Z0-9-_]+$/,
      messages: {
        stringMin: "eddress should be more than 3 characters",
        stringMax: "eddress should not be at more than 32 characters",
        stringPattern: "eddress should only contain letters, numbers, underscores and dashes"
      }
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
  async handler(params) {
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
    accountId: { ...any },
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
  async handler(params) {
    await checkAuthorization(params.accountId, params.locationId, "location");
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
    filters: {
      type: "object",
      default: {}
    }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    return models.Location.aggregate([
      {
        $match: {
          ownerId: db.utils.ObjectId(params.accountId),
          ownerType: "account",
          ...params.filters
        }
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
      {
        $lookup: {
          from: models.Project.collection.collectionName,
          localField: "_id",
          foreignField: "locationId",
          as: "projects",
        }
      },
      {
        $lookup: {
          from: models.Event.collection.collectionName,
          localField: "_id",
          foreignField: "locationId",
          as: "events",
        }
      }
    ]);
  }
});

module.exports.getAccountFollowedLocations = wrapServiceAction({
  params: {
    accountId: { ...any },
    limit: {
      type: "number",
      default: 0
    },
    filters: {
      type: "object",
      default: {}
    }
  },
  async handler(params) {
    const locations = await models.LocationFollower.find({
      followerId: db.utils.ObjectId(params.accountId)
    });
    const ids = locations.map(l => l.locationId);
    return models.Location.aggregate([
      {
        $match: {
          _id: { $in: ids },
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
      {
        $lookup: {
          from: models.Project.collection.collectionName,
          localField: "_id",
          foreignField: "locationId",
          as: "projects",
        }
      },
      {
        $lookup: {
          from: models.Event.collection.collectionName,
          localField: "_id",
          foreignField: "locationId",
          as: "events",
        }
      }
    ]);
  }
});

module.exports.getPageLocations = wrapServiceAction({
  params: {
    pageId: { ...any },
    limit: {
      type: "number",
      default: 0
    },
    filters: {
      type: "object",
      default: {}
    }
  },
  async handler(params) {
    return models.Location.aggregate([
      {
        $match: {
          ownerId: db.utils.ObjectId(params.pageId),
          ownerType: "page",
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
      {
        $lookup: {
          from: models.Project.collection.collectionName,
          localField: "_id",
          foreignField: "locationId",
          as: "projects",
        }
      },
      {
        $lookup: {
          from: models.Event.collection.collectionName,
          localField: "_id",
          foreignField: "locationId",
          as: "events",
        }
      }
    ]);
  }
});

module.exports.getLocationDetails = wrapServiceAction({
  params: {
    username: { ...string },
    eddress: { ...string }
  },
  async handler(params) {
    const account = await models.Account.findOne({
      username: params.username
    });
    const page = await models.Page.findOne({
      username: params.username
    });
    if (!account && !page) {
      throw new ServiceError("location not found");
    }
    return await models.Location.findOne({
      ownerId: (account || page)._id,
      eddress: params.eddress
    });
  }
});

module.exports.getLocationDetailsById = wrapServiceAction({
  params: {
    locationId: { ...any }
  },
  async handler(params) {
    return await models.Location.findById(params.locationId);
  }
});

module.exports.getAccountLocationsCount = wrapServiceAction({
  params: {
    accountId: { ...any },
    filters: {
      type: "object",
      default: {}
    }
  },
  async handler(params) {
    return await models.Location.countDocuments({
      ownerId: params.accountId,
      ownerType: "account",
      ...params.filters
    });
  }
});

module.exports.getLocationCategories = wrapServiceAction({
  async handler() {
    return await models.LocationCategory.find();
  }
});

module.exports.createLocationAlarm = wrapServiceAction({
  params: {
    accountId: { ...any },
    locationId: { ...objectId },
    description: { ...string }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const location = await models.Location.findById(params.locationId);
    if (!location) {
      throw new ServiceError("location not found");
    }
    // check permissions
    if (
      location.visibility === "private" &&
      location.ownerType === "account" &&
      location.ownerId.toString() !== params.accountId.toString()
    ) {
      throw new AuthorizationError("you do not have sufficient permissions to access this object");
    }
    // check if alarm exists in this location
    let alarm = await models.LocationAlarm.findOne({
      accountId: params.accountId,
      locationId: params.locationId
    });
    if (alarm) {
      alarm.additionalDescriptions.push(params.description);
      await alarm.save();
    } else {
      alarm = await models.LocationAlarm.create({
        accountId: params.accountId,
        locationId: params.locationId,
        description: params.description
      });
    }
    return {
      ...alarm.toObject(),
      location
    };
  }
});

module.exports.getAccountLocationAlarms = wrapServiceAction({
  params: {
    accountId: { ...any }
  },
  async handler(params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    return models.LocationAlarm.aggregate([
      {
        $match: {
          accountId: params.accountId
        }
      },
      {
        $lookup: {
          from: models.Location.collection.collectionName,
          localField: "locationId",
          foreignField: "_id",
          as: "location",
        }
      }
    ]);
  }
});

module.exports.followLocation = wrapServiceAction({
  params: {
    $$strict: "remove",
    locationId: { ...any },
    followerId: { ...any }
  },
  async handler(params) {
    const location = await models.Location.findById(params.locationId);
    const follower = await models.Account.findById(params.followerId);
    if (!location) {
      throw new ServiceError("location not found");
    }
    if (!follower) {
      throw new ServiceError("account not found");
    }

    const record = await models.LocationFollower.findOne({
      locationId: params.locationId,
      followerId: params.followerId
    });

    if (record) {
      throw new ServiceError("you are already following this location");
    }

    location.followersCount++;

    await Promise.all([
      location.save()
    ]);

    return await models.LocationFollower.findOneAndUpdate({
      locationId: params.locationId,
      followerId: params.followerId
    }, {}, {
      upsert: true,
      new: true
    });
  }
});

module.exports.unfollowLocation = wrapServiceAction({
  params: {
    $$strict: "remove",
    locationId: { ...any },
    followerId: { ...any }
  },
  async handler(params) {
    const location = await models.Location.findById(params.locationId);
    const follower = await models.Account.findById(params.followerId);
    if (!location) {
      throw new ServiceError("location not found");
    }
    if (!follower) {
      throw new ServiceError("account not found");
    }

    const record = await models.LocationFollower.findOne({
      locationId: params.locationId,
      followerId: params.followerId
    });

    if (!record) {
      throw new ServiceError("you are not following this location");
    }

    location.followersCount--;

    await Promise.all([
      location.save()
    ]);

    return await models.LocationFollower.findOneAndDelete({
      locationId: params.locationId,
      followerId: params.followerId
    });
  }
});

module.exports.getLocationFollowers = wrapServiceAction({
  params: {
    $$strict: "remove",
    locationId: { ...any }
  },
  async handler(params) {
    return models.LocationFollower.aggregate([
      { $match: { locationId: ObjectId(params.locationId) } },
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
          username: 1,
          profileImage: 1
        }
      }
    ]);
  }
});
