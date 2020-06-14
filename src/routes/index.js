const express = require("express");
const router = express.Router();

module.exports = router;

router.use("/mailing-list", require("./mailingList"));

router.use("/verification", require("./verification"));

router.use("/auth", require("./authentication"));

router.use("/accounts", require("./accounts"));
