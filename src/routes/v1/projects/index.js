const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  addProject,
  updateProject
} = require("../../../controllers/project");

router.use(verifyAccountAuth());

router.route("/")
  .post(addProject);

router.route("/:projectId/update")
  .post(updateProject);

module.exports = router;
