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
    accountId: { ...any },
    name: { ...string, min: 4 },
    description: { ...string, min: 16 },
    visibility: { type: "enum", values: ["public", "private"] },
    coordinates: {
      type: "object",
      props: {
        latitude: { type: "number", min: -90, max: 90 },
        longitude: { type: "number", min: -180, max: 180 }
      }
    }
  },
  async handler(params) {
    const {
      latitude,
      longitude
    } = params.coordinates;
    return models.Location.create({
      accountId: params.accountId,
      name: params.name,
      description: params.description,
      visibility: params.visibility,
      preciseLocation: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      plusCode: OpenLocationCode.encode(latitude, longitude)
    });
  }
});

module.exports.tagLocation = wrapServiceAction({
  params: {
    accountId: { ...any },
    locationId: { ...any },
    eddress: { ...string, min: 4, lowercase: true, alphanum: true }
  },
  async handler(params) {
    const location = models.Location.findOne({
      accountId: params.accountId,
      locationId: params.locationId,
      eddress: params.eddress
    });
    if (location) {
      throw new ServiceError("you have already tagged a location with this eddress");
    }
    return models.Location.findByIdAndUpdate(params.locationId, {
      eddress: params.eddress
    }, { new: true });
  }
});
