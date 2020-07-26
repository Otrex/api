const Validator = require("fastest-validator");
const validator = new Validator({
  messages: {
    objectID: "The '{field}' field must be an objectId"
  }
});

validator.add("objectID", function({ schema, messages, index }, path, context) {
  const src = [];

  if (!context.customs[index]) context.customs[index] = { schema };
  else context.customs[index].schema = schema;

  src.push(`
		const ObjectID = context.customs[${index}].schema.ObjectID;
		const isObjectID = (id) => ObjectID.isValid(id.toString()) && (new ObjectID(id.toString())).toString() === id.toString();
		if (!isObjectID(value)) {
			${this.makeError({ type: "objectID", actual: "value", messages })}
		}
		${schema.convert ? "return new ObjectID(value)" : "return value;" } ;
	`);

  return {
    source: src.join("\n")
  };
});

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
