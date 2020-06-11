const Validator = require("fastest-validator");
const validator = new Validator();
const {
  ValidationError
} = require("../../errors");

const wrapServiceAction = (action) => {
  const validate = action.params
    ? validator.compile(action.params)
    : null;

  return async function (params) {
    if (validate) {
      const errors = validate(params);
      if (Array.isArray(errors)) {
        throw new ValidationError(errors);
      }
    }
    return await action.handler(params);
  };
};

module.exports = wrapServiceAction;
