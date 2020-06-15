const express = require("express");
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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

config.env.isProduction
  ? app.use(morgan("common"))
  : app.use(morgan("dev"));

app.get("/", (req, res) => {
  return res.send({
    status: "success",
    message: "Pointograph"
  });
});

app.use(setAccountSession);

// routes
app.use(require("./routes"));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
