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
    limit: {
      type: "number",
      optional: true
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
        $project: {
          username: 1,
          followersCount: 1
        }
      },
      {
        $set: {
          _type: "account"
        }
      }
    ]);
    return users;
  }
});
