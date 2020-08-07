const config = require("../config");

module.exports.notFoundHandler = (req, res) => {
  return res.status(404).send({
    status: "error",
    message: "not found!"
  });
};

module.exports.errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  switch (err.name) {
  case "ValidationError":
    return res.status(422).send({
      status: "error",
      message: err.message,
      errors: err.errors
    });
  case "ServiceError":
    return res.status(200).send({
      status: "error",
      message: err.message
    });
  case "AuthenticationError":
    return res.status(401).send({
      status: "error",
      message: err.message
    });
  case "AuthorizationError":
    return res.status(403).send({
      status: "error",
      message: err.message
    });
  case "NotFoundError":
    return res.status(404).send({
      status: "error",
      message: err.message
    });
  default:
    console.error(err);
    return res.status(500).send({
      status: "error",
      message: "an error occurred",
      ...(
        config.env.isProduction
          ? {}
          : { error: err.message || err.toString() }
      )
    });
  }
};
