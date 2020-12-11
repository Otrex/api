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
module.exports.getQuestions = wrapServiceAction({
  async handler() {
    return models.FrequentlyAskedQuestion.find();
  }
});

module.exports.addQuestion = wrapServiceAction({
  async handler() {
    return models.FrequentlyAskedQuestion.create({
      question: "How Do I Create An Account",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
    });
  }
});
