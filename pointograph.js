const http = require("http");
const config = require("./src/config");
const db = require("./src/db");
const app = require("./src/app");

db.createConnection().then(() => {
  http.createServer(app).listen(config.app.port, () => {
    console.log(`listening on port: ${config.app.port}`);
  });
});

