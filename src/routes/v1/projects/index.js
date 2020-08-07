const express = require("express");
const router = express.Router();

const {
  verifyAccountAuth,
} = require("../../../middlewares/authentication");

const {
  addProject,
  getSingleProject,
  updateProject,
  getProjectCategories
} = require("../../../controllers/project");

router.use(verifyAccountAuth());

router.route("/")
  .post(addProject);

router.route("/categories")
  .get(getProjectCategories);

router.route("/:projectId")
  .get(getSingleProject);

router.route("/:projectId/update")
  .post(updateProject);


module.exports = router;
