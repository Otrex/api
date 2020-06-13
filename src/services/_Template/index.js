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
module.exports.action = wrapServiceAction({
  params: {
    field: { ...string }
  },
  async handler(params) {
    return params;
  }
});
