const ProjectService = require("../services/Project");
const {
  successResponse
} = require("../utils");

module.exports.addProject = async (req, res, next) => {
  try {
    const data = await ProjectService.createProject({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};

module.exports.updateProject = async (req, res, next) => {
  try {
    const data = await ProjectService.updateProject({
      ...req.body,
      projectId: req.params.projectId,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};
