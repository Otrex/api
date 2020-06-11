const wrapServiceAction = require("../_core/wrapServiceAction");

const models = require("../../db").models;

/*
* Validation Helpers
* */
const { email } = require("../../validation");


/*
* Service Dependencies
* */


/*
* Service Actions
* */
module.exports.addEmailToMailingList = wrapServiceAction({
  params: {
    email: { ...email }
  },
  async handler(params) {
    const item = await models.MailingList.findOne({
      email: params.email
    });
    if (item) {
      return false;
    }
    return await models.MailingList.create({
      email: params.email
    });
  }
});
