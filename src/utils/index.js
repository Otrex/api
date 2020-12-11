const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Handlebars = require("handlebars");
const config = require("../config");

module.exports = {
  bcryptHash,
  bcryptCompare,
  generateJWTToken,
  decodeToken,
  groupBy,
  errorResponse,
  successResponse,
  slugify,
  generateRandomCode,
  generateHash,
  deleteUploadedFile,
  renderTemplate
};

async function bcryptHash(password) {
  return bcrypt.hash(password, config.app.bcryptRounds);
}

async function bcryptCompare(password, hash) {
  return bcrypt.compare(password, hash);
}

function groupBy(array, key) {
  return array.reduce((final, item) => {
    (final[item[key]] = final[item[key]] || []).push(item);
    return final;
  }, {});
}

async function generateJWTToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign({
      ...payload,
      counter: generateRandomCode(6)
    }, config.app.jwtSigningKey, { expiresIn: "24h" }, (err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
}

async function decodeToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.app.jwtSigningKey, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded);
    });
  });
}

function errorResponse(error) {
  const response = { status: "error", message: "an error occurred" };
  if (typeof error === "string") {
    response.message = error;
    return response;
  }
  response.error = error.toString();
  return response;
}

function successResponse(message, data) {
  return {
    status: "success",
    message,
    data
  };
}

function generateRandomCode(length) {
  return crypto.randomBytes(length * 3)
    .toString("base64")
    .split("+").join("")
    .split("/").join("")
    .split("=").join("")
    .substr(0, length);
}

function generateHash(seed) {
  const data = seed.toString() + Date.now().toString();
  return crypto.createHash("sha256").update(data).digest("hex");
}

function slugify(string = "") {
  const a = "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b = "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return string.toString().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function getModelUpdates(model, updates) {
  const filtered = {};
  if (updates && typeof updates === "object") {
    for (const key of Object.keys(updates)) {
      if (updates[key] && updates[key] !== model[key]) {
        filtered[key] = updates[key];
      }
    }
  }
  return filtered;
}

function deleteUploadedFile(filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(config.app.uploadsDir, filename), function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function renderTemplate(template, context) {
  return Handlebars.compile(template)(context);
}
