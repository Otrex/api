const PageService = require("../services/Page");
const {
  successResponse
} = require("../utils");

module.exports.createPage = async (req, res, next) => {
  try {
    await PageService.createPage({
      ...req.body,
      accountId: req.session.account._id
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.getSinglePage = async (req, res, next) => {
  try {
    const data = await PageService.getPage({
      accountId: req.session.account._id,
      pageId: req.params.pageId
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.getPages = async (req, res, next) => {
  try {
    const data = await PageService.getPages({
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.updatePage = async (req, res, next) => {
  try {
    const data = await PageService.updatePage({
      ...req.body,
      pageId: req.params.pageId,
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.followPage = async (req, res, next) => {
  try {
    await PageService.followPage({
      pageId: req.params.pageId,
      followerId: req.session.account._id
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.unfollowPage = async (req, res, next) => {
  try {
    await PageService.unfollowPage({
      pageId: req.params.pageId,
      followerId: req.session.account._id
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.getFollowers = async (req, res, next) => {
  try {
    const data = await PageService.getPageFollowers({
      pageId: req.params.pageId
    });
    return res.send(successResponse("success", data));
  } catch (e) {
    next(e);
  }
};

module.exports.getTeamMembers = async (req, res, next) => {
  try {
    const data = await PageService.getPageTeamMembers({
      pageId: req.params.pageId,
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.getTeamMemberInvites = async (req, res, next) => {
  try {
    const data = await PageService.getPageTeamMemberInvitations({
      pageId: req.params.pageId,
      accountId: req.session.account._id
    });
    return res.send(successResponse(undefined, data));
  } catch (e) {
    next(e);
  }
};

module.exports.sendTeamMemberInvites = async (req, res, next) => {
  try {
    await PageService.sendPageTeamMemberInvitation({
      pageId: req.params.pageId,
      accountId: req.session.account._id,
      email: req.body.email
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.acceptTeamMemberInvite = async (req, res, next) => {
  try {
    await PageService.acceptPageTeamMemberInvitation({
      pageId: req.params.pageId,
      accountId: req.session.account._id,
      inviteToken: req.params.inviteToken,
      email: req.body.email
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.rejectTeamMemberInvite = async (req, res, next) => {
  try {
    await PageService.rejectPageTeamMemberInvitation({
      pageId: req.params.pageId,
      accountId: req.session.account._id,
      inviteToken: req.params.inviteToken,
      email: req.body.email
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.assignObjectsToTeamMember = async (req, res, next) => {
  try {
    await PageService.assignObjectsToPageTeamMember({
      accountId: req.session.account._id,
      pageId: req.params.pageId,
      memberId: req.params.memberId,
      objects: req.body.objects
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.removeAssignedObjectFromTeamMember = async (req, res, next) => {
  try {
    await PageService.removeAssignedObjectFromPageTeamMember({
      accountId: req.session.account._id,
      pageId: req.params.pageId,
      memberId: req.params.memberId,
      assignedObjectId: req.params.objectId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.removeTeamMember = async (req, res, next) => {
  try {
    await PageService.removePageTeamMember({
      accountId: req.session.account._id,
      pageId: req.params.pageId,
      memberId: req.params.memberId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.removePage = async (req, res, next) => {
  try {
    await PageService.removePage({
      accountId: req.session.account._id,
      pageId: req.params.pageId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};
