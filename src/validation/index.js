/*
* fastest-validator (https://github.com/icebob/fastest-validator)
* validation type defaults
* */

module.exports.string = { type: "string", empty: false, trim: true };
module.exports.email = { type: "email", normalize: true };