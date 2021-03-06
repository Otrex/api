const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  createPage,
  getPages,
  getSinglePage,
  updatePage,
  followPage,
  unfollowPage,
  getFollowers,
  getPageLocations,
  addLocationToPage,
  getTeamMembers,
  getTeamMemberInvites,
  sendTeamMemberInvites,
  acceptTeamMemberInvite,
  rejectTeamMemberInvite,
  updateTeamMember,
  assignObjectsToTeamMember,
  removeAssignedObjectFromTeamMember,
  removeTeamMember,
  removePage
} = require("../../../controllers/page");

router.use(verifyAccountAuth());

router.route("/")
  .get(getPages)
  .post(createPage);

router.route("/:pageId")
  .get(getSinglePage);

router.route("/:pageId/update")
  .post(updatePage);

router.route("/:pageId/follow")
  .post(followPage);

router.route("/:pageId/unfollow")
  .post(unfollowPage);

router.route("/:pageId/followers")
  .get(getFollowers);

router.route("/:pageId/locations")
  .get(getPageLocations)
  .post(addLocationToPage);

router.route("/:pageId/team")
  .get(getTeamMembers);

router.route("/:pageId/team/invites")
  .get(getTeamMemberInvites);

router.route("/:pageId/team/invites")
  .post(sendTeamMemberInvites);

router.route("/:pageId/team/invites/:inviteToken/accept")
  .post(acceptTeamMemberInvite);

router.route("/:pageId/team/invites/:inviteToken/reject")
  .post(rejectTeamMemberInvite);

router.route("/:pageId/team/:memberId/update")
  .post(updateTeamMember);

router.route("/:pageId/team/:memberId/objects")
  .post(assignObjectsToTeamMember);

router.route("/:pageId/team/:memberId/objects/:objectId/remove")
  .post(removeAssignedObjectFromTeamMember);

router.route("/:pageId/team/:memberId/remove")
  .post(removeTeamMember);

router.route("/:pageId/delete")
  .post(removePage);

module.exports = router;
