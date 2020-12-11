/*
* fastest-validator (https://github.com/icebob/fastest-validator)
* validation type defaults
* */

const ObjectID = require("../db").utils.ObjectId;

module.exports.any = { type: "any" };
module.exports.string = { type: "string", empty: false, trim: true };
module.exports.email = { type: "email", normalize: true };
module.exports.objectId = { type: "objectID", ObjectID };
