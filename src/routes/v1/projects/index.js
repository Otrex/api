const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  addProject,
  updateProject,
  getProjectCategories
} = require("../../../controllers/project");

router.use(verifyAccountAuth());

router.route("/")
  .post(addProject);

router.route("/:projectId/update")
  .post(updateProject);

router.route("/categories")
  .get(getProjectCategories);

module.exports = router;
