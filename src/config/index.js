const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  env: {
    isProduction: process.env.NODE_ENV === "production",
  },
  app: {
    bcryptRounds: 10,
    jwtSigningKey: process.env.JWT_SIGNING_KEY || "DEADBOLT",
    port: process.env.PORT || "5678"
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "27017",
    database: process.env.DB_DATABASE || "pointograph",
    user: process.env.DB_USER ||"root",
    password: process.env.DB_PASSWORD ||"root",
    authSource: process.env.DB_AUTH_SOURCE || "admin"
  }
};

module.exports = config;
