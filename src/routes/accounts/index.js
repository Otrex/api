const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../middlewares/authentication");

const {
  followAccount,
  unfollowAccount,
  getFollowers,
  getFollowings
} = require("../../controllers/account");


router.use(verifyAccountAuth());

router.route("/follow")
  .post(followAccount);

router.route("/unfollow")
  .post(unfollowAccount);

router.route("/:accountId?/followers")
  .get(getFollowers);

router.route("/:accountId?/followings")
  .get(getFollowings);

module.exports = router;
