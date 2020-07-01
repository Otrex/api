const http = require("http");
const config = require("./src/config");
const db = require("./src/db");
const app = require("./src/app");

db.createConnection().then(async () => {
  http.createServer(app).listen(config.app.port, () => {
    console.log(`listening on port: ${config.app.port}`);
  });
  // populate territories
  // const countries = require("./src/lib/countries.json");
  // for (const feature of countries.features) {
  //   if (feature.properties.ADMIN === "Antarctica") {
  //     continue;
  //   }
  //   await db.models.Territory.create({
  //     name: feature.properties.ADMIN,
  //     description: feature.properties.ADMIN,
  //     properties: feature.properties,
  //     geometry: feature.geometry
  //   }).catch(e => console.error("error", e) && process.exit(1));
  //   console.log("done for: ", feature.properties.ADMIN);
  // }
});

