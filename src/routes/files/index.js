const path = require("path");
const express = require("express");
const router = express.Router();
const config = require("../../config");
const db = require("../../db");
const utils = require("../../utils");

module.exports = router;

/*
* /files/:filename
* */
router.use("/", express.static(config.app.uploadsDir));

/*
* /files/upload
* */
router.post("/upload", async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.send(utils.errorResponse("request contains no files"));
  }
  let file = req.files[Object.keys(req.files)[0]];
  let hash = utils.generateRandomCode("64");
  // let ext = "";
  // if (file.name && file.name.includes(".")) {
  //   ext = file.name.split(".").pop();
  //   ext = `.${ext}`;
  // }
  let filename = `${hash}`;
  file.mv(path.join(config.app.uploadsDir, filename), async (err) => {
    if (err) {
      return next(err);
    }
    await db.models.PendingUpload.create({
      filename
    });
    return res.send(utils.successResponse("upload successful", { filename }));
  });
});
