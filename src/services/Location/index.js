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
    eddress: { ...string, min: 4, lowercase: true, alphanum: true },
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
    const location = await models.Location.findOne({
      accountId: params.accountId,
      eddress: params.eddress
    });
    if (location) {
      throw new ServiceError("you have already added a location with this eddress");
    }
    return models.Location.create({
      accountId: params.accountId,
      name: params.name,
      description: params.description,
      visibility: params.visibility,
      eddress: params.eddress,
      preciseLocation: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      plusCode: OpenLocationCode.encode(latitude, longitude)
    });
  }
});
