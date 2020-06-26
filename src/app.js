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
const {
  setAccountSession
} = require("./middlewares/authentication");

app.set("trust proxy", true);
app.use(cors());
app.use(helmet());

app.use(fileUpload({ createParentPath: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

config.env.isProduction
  ? app.use(morgan("common"))
  : app.use(morgan("dev"));

app.use(setAccountSession);

// routes
// app.use(express.static("../public"));
app.use(require("./routes"));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
