const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  env: {
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
  },
  app: {
    bcryptRounds: 10,
    jwtSigningKey: process.env.JWT_SIGNING_KEY,
    port: process.env.PORT,
    uploadsDir: path.join(__dirname, "../../public/uploads")
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    authSource: process.env.DB_AUTH_SOURCE
  }
};

module.exports = config;
