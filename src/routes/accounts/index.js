const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  getProfile,
  followAccount,
  unfollowAccount,
  getFollowers,
  getFollowings
} = require("../../controllers/account");


router.use(verifyAccountAuth());

router.route("/:accountId?/profile")
  .get(getProfile);

router.route("/follow")
  .post(followAccount);

router.route("/unfollow")
  .post(unfollowAccount);

router.route("/:accountId?/followers")
  .get(getFollowers);

router.route("/:accountId?/followings")
  .get(getFollowings);

module.exports = router;
