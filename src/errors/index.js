class GenericError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ServiceError extends GenericError {
  constructor(message) {
    super(message);
  }
}

class ValidationError extends GenericError {
  constructor(errors = [], message = "validation error") {
    message = `${message}: ${errors[0].message}`;
    super(message);
    this.errors = errors;
  }
}

module.exports = {
  ServiceError,
  ValidationError
};
