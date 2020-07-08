const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");

const app = express();

const {
  notFoundHandler,
  errorHandler
} = require("./middlewares");

app.set("trust proxy", true);
app.use(cors());
app.use(helmet());

app.use(fileUpload({ createParentPath: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

config.env.isProduction
  ? app.use(morgan("common"))
  : app.use(morgan("dev"));

// routes
app.use(require("./routes/v1"));
app.use("/admin", require("./routes/v1/admin"));

app.use("/v2", (req, res) => {
  return res.status(200).send({
    status: "success"
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;


