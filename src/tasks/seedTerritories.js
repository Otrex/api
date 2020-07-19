const db = require("../db");
const TerritoryService = require("../services/Territory");

(async function () {
  await db.createConnection();
  console.log("[INFO] connected to DB!");

  console.log("--> Populating NGA Territories");
  const data = require("../data/territories/NGA/gadm36_NGA_0.geo.json");
  const data1 = require("../data/territories/NGA/gadm36_NGA_1.geo.json");
  const data2 = require("../data/territories/NGA/gadm36_NGA_2.geo.json");

  console.log("--> Populating NGA Level 0 Territories");
  await TerritoryService.createTerritory({
    geojson: data
  });

  console.log("--> Populating NGA Level 1 Territories");
  await TerritoryService.createTerritory({
    geojson: data1
  });

  console.log("--> Populating NGA Level 2 Territories");
  await TerritoryService.createTerritory({
    geojson: data2
  });

  console.log("--> Finished Populating NGA Territories");
})();
