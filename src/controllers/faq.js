const FrequentlyAskedQuestionService = require("../services/FrequentlyAskedQuestion");
const {
  successResponse
} = require("../utils");

module.exports.getQuestions = async (req, res, next) => {
  try {
    const data = await FrequentlyAskedQuestionService.getQuestions();
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};
