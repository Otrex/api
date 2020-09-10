const cron = require("node-cron");
const fanOutFeeds = require("../fanoutFeeds");

cron.schedule("*/30 * * * * *", async () => {
  console.log("::-> Running FAN_OUT_FEEDS");
  await fanOutFeeds();
});
