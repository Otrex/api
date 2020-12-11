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
    geojson: { type: "object" }
  },
  async handler (params) {
    for (const feature of params.geojson.features) {
      try {
        let {
          NAME_0,
          NAME_1,
          NAME_2,
          VARNAME_2
        } = feature.properties;
        NAME_2 = VARNAME_2 || NAME_2;
        const name = [NAME_2, NAME_1, NAME_0].filter(n => !!n).join(", ");
        await models.Territory.create({
          name: name,
          description: name,
          properties: feature.properties,
          geometry: feature.geometry
        });
      } catch (e) {
        console.error(e);
      }
    }
    return true;
  }
});

module.exports.getTerritories = wrapServiceAction({
  params: {
    filters: {
      type: "object",
      optional: true,
      default: {}
    }
  },
  async handler (params) {
    return await models.Territory.find(
      params.filters
    ).select({
      name: 1,
      description: 1
    });
  }
});

module.exports.trackTerritory = wrapServiceAction({
  params: {
    territoryId: { ...any },
    trackerId: { ...any }
  },
  async handler (params) {
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
    }, {}, {
      upsert: true,
      new: true
    });
  }
});

module.exports.unTrackTerritory = wrapServiceAction({
  params: {
    territoryId: { ...any },
    trackerId: { ...any }
  },
  async handler (params) {
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

module.exports.getTerritoryDetails = wrapServiceAction({
  params: {
    territoryId: { ...any },
    accountId: { ...any }
  },
  async handler (params) {
    const territory = await models.Territory.findById(params.territoryId).select({
      name: 1,
      description: 1,
      trackersCount: 1
    });
    const isTracking = await models.TerritoryTracker.findOne({
      territoryId: params.territoryId,
      trackerId: params.accountId
    });
    if (!territory) {
      throw new ServiceError("territory not found");
    }
    return {
      ...territory.toJSON(),
      isTracking: !!isTracking
    };
  }
});
