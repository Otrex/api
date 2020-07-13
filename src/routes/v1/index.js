const express = require("express");
const combinedRouter = express.Router();
const router = express.Router();

const {
  setAccountSession
} = require("../../middlewares/authentication");

module.exports = combinedRouter;

router.use(setAccountSession);

// Documentation
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../../docs/api.json");

router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(swaggerDocument));

// Endpoints
router.use("/verification", require("./verification"));

router.use("/auth", require("./authentication"));

router.use("/accounts", require("./accounts"));

router.use("/pages", require("./pages"));

router.use("/locations", require("./locations"));

router.use("/territories", require("./territories"));

router.use("/files", require("./files"));

router.use("/photos", require("./photos"));

router.use("/events", require("./events"));

router.use("/search", require("./search"));

router.use("/mailing-list", require("./mailingList"));

combinedRouter.use("/admin", require("./admin"));
combinedRouter.use("/", router);
