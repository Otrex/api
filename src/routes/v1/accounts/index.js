const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  getProfile,
  updateProfile,
  changePassword,
  followAccount,
  unfollowAccount,
  getFollowers,
  getFollowings,
  getEvents,
  getProjects
} = require("../../../controllers/account");


router.use(verifyAccountAuth());

router.route("/:username?/profile")
  .get(getProfile);

router.route("/profile/update")
  .post(updateProfile);

router.route("/password/change")
  .post(changePassword);

router.route("/:accountId?/follow")
  .post(followAccount);

router.route("/:accountId?/unfollow")
  .post(unfollowAccount);

router.route("/:accountId?/followers")
  .get(getFollowers);

router.route("/:accountId?/followings")
  .get(getFollowings);

router.route("/:accountId?/projects")
  .get(getProjects);

router.route("/:accountId?/events")
  .get(getEvents);

module.exports = router;
