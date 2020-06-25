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
module.exports.createTerritory = wrapServiceAction({
  params: {
    name: { ...string },
    description: { ...string }
  },
  async handler(params) {
    return models.Territory.create({
      name: params.name,
      description: params.description
    });
  }
});

module.exports.trackTerritory = wrapServiceAction({
  params: {
    territoryId: { ...any },
    trackerId: { ...any }
  },
  async handler(params) {
    const territory = await models.Territory.findById(params.territoryId);
    const tracker = await models.Account.findById(params.trackerId);
    if (!territory) {
      throw new ServiceError("territory not found");
    }
    if (!tracker) {
      throw new ServiceError("account not found");
    }
    const record = await models.TerritoryTracker.findOne({
      territoryId: params.territoryId,
      trackerId: params.trackerId
    });

    if (record) {
      throw new ServiceError("you are already tracking this territory");
    }

    territory.trackersCount++;
    await territory.save();

    return await models.TerritoryTracker.findOneAndUpdate({
      territoryId: params.territoryId,
      trackerId: params.trackerId
    }, {}, { upsert: true, new: true });
  }
});

module.exports.unTrackTerritory = wrapServiceAction({
  params: {
    territoryId: { ...any },
    trackerId: { ...any }
  },
  async handler(params) {
    const territory = await models.Territory.findById(params.territoryId);
    const tracker = await models.Account.findById(params.trackerId);
    if (!territory) {
      throw new ServiceError("territory not found");
    }
    if (!tracker) {
      throw new ServiceError("account not found");
    }

    const record = await models.TerritoryTracker.findOne({
      territoryId: params.territoryId,
      trackerId: params.trackerId
    });

    if (!record) {
      throw new ServiceError("you are not tracking this territory");
    }

    territory.trackersCount--;
    await territory.save();

    return await models.TerritoryTracker.findOneAndDelete({
      territoryId: params.territoryId,
      trackerId: params.trackerId
    });
  }
});
