const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

const models = require("../../db").models;

/*
* Validation Helpers
* */
const { string } = require("../../validation");

/*
* Service Dependencies
* */


/*
* Service Actions
* */

module.exports.search = wrapServiceAction({
  params: {
    query: { ...string },
    accountId: { type: "any" },
    limit: {
      type: "number",
      default: 3
    }
  },
  async handler(params) {
    const users = models.Account.aggregate([
      {
        $match: {
          username: {
            $regex: new RegExp(params.query)
          }
        }
      },
      {
        $lookup:
          {
            from: models.AccountFollower.collection.collectionName,
            let: { accountId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr:
                    {
                      $and: [
                        { $eq: ["$$accountId", "$accountId"] },
                        { $eq: [params.accountId, "$followerId"] }
                      ]
                    }
                }
              },
              {
                $count: "count"
              }
            ],
            as: "isFollowing"
          }
      },
      {
        $project: {
          username: 1,
          followersCount: 1,
          location: 1,
          isFollowing: 1
        }
      },
      {
        $set: {
          isFollowing: { $arrayElemAt: ["$isFollowing", 0] },
          _type: "account"
        }
      },
      {
        $set: {
          isFollowing: {
            $cond: [
              { $gte: ["$isFollowing.count", 1] },
              true,
              false
            ]
          }
        }
      }
    ]);
    return users;
  }
});
