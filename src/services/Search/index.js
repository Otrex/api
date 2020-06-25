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
            $regex: new RegExp(params.query, "i")
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
    const territories = models.Territory.aggregate([
      {
        $match: {
          $or: [
            {
              name: {
                $regex: new RegExp(params.query, "i")
              }
            },
            {
              description: {
                $regex: new RegExp(params.query, "i")
              }
            },
          ]
        }
      },
      {
        $project: {
          name: 1,
          description: 1
        }
      },
      {
        $set: {
          _type: "territory"
        }
      },
    ]);
    const locations = models.Location.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  name: {
                    $regex: new RegExp(params.query, "i")
                  }
                },
                {
                  description: {
                    $regex: new RegExp(params.query, "i")
                  }
                }
              ]
            },
            { visibility: "public" }
          ]
        }
      },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          let: { accountId: "$accountId" },
          pipeline: [
            {
              $match: {
                $expr:
                  {
                    $and: [
                      { $eq: ["$$accountId", "$_id"] }
                    ]
                  }
              }
            },
            {
              $project: {
                username: 1
              }
            }
          ],
          as: "owner"
        }
      },
      {
        $set: {
          longitude: { $arrayElemAt: ["$preciseLocation.coordinates", 0] },
          latitude: { $arrayElemAt: ["$preciseLocation.coordinates", 1] },
          owner: { $arrayElemAt: ["$owner", 0] },
        }
      },
      {
        $project: {
          name: 1,
          eddress: 1,
          longitude: 1,
          latitude: 1,
          owner: 1
        }
      },
      {
        $set: {
          _type: "location"
        }
      },
    ]);
    const results = await Promise.all([
      users,
      territories,
      locations
    ]);
    return Array.from([]).concat(...results);
  }
});
