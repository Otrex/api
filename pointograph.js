const http = require("http");
const config = require("./src/config");
const db = require("./src/db");
const app = require("./src/app");

db.createConnection().then(async () => {
  http.createServer(app).listen(config.app.port, () => {
    console.log(`http server listening on port: ${config.app.port}`);
  });
});

// websocket
const websocket = async () => {
  const IOServer = require("socket.io");
  const socketHttpServer = http.createServer();

  const WebsocketService = require("./src/services/Websocket");
  await WebsocketService.setUpSocketIOServer({
    io: IOServer(socketHttpServer)
  });
  socketHttpServer.listen(3301, () => {
    console.log(`websocket server listening on port: ${3301}`);
  });
};

websocket().catch((e) => console.log(e) && process.exit(-1));

// cron jobs
// require("./src/tasks/cron");
