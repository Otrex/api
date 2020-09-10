const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

const db = require("../../db");
const models = db.models;

/*
* Validation Helpers
* */
const { string, objectId } = require("../../validation");

/*
* Service Dependencies
* */

/*
* Service Actions
* */
module.exports.getAccountFeeds = wrapServiceAction({
  params: {
    accountId: { ...objectId }
  },
  async handler (params) {
    const buckets = await models.FeedBucket.aggregate([
      {
        $match: {
          ownerId: db.utils.ObjectId(params.accountId),
          ownerType: "account"
        }
      },
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: models.Action.collection.name,
          localField: "actions",
          foreignField: "_id",
          as: "actions"
        }
      }
    ]);
    return buckets.map(b => b.actions).flat();
  }
});
