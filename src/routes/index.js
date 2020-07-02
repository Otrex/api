const express = require("express");
const router = express.Router();

const {
  setAccountSession
} = require("../middlewares/authentication");

module.exports = router;

router.use(setAccountSession);

// file uploads
router.use("/files", require("./files"));

router.use("/mailing-list", require("./mailingList"));

router.use("/verification", require("./verification"));

router.use("/auth", require("./authentication"));

router.use("/accounts", require("./accounts"));

router.use("/search", require("./search"));

router.use("/locations", require("./locations"));

router.use("/territories", require("./territories"));

router.use("/pages", require("./pages"));

router.use("/photos", require("./photos"));
