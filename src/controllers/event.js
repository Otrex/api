const EventService = require("../services/Event");
const {
  successResponse
} = require("../utils");

module.exports.addEvent = async (req, res, next) => {
  try {
    const data = await EventService.createEvent({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};

module.exports.updateEvent = async (req, res, next) => {
  try {
    const data = await EventService.updateEvent({
      ...req.body,
      eventId: req.params.eventId,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};

module.exports.getEventCategories = async (req, res, next) => {
  try {
    const data = await EventService.getEventCategories();
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};
