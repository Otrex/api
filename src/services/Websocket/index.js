const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

const models = require("../../db").models;

/*
* Validation Helpers
* */
const { any, string } = require("../../validation");

/*
* Service Dependencies
* */

/*
* Globals
* */
let io;
let ChatNamespace;

/*
* Service Actions
* */
module.exports.setUpSocketIOServer = wrapServiceAction({
  params: {
    io: { ...any }
  },
  async handler (params) {
    io = params.io;
    ChatNamespace = io.of("chat");
    ChatNamespace.use(async (socket, next) => {
      let token = socket.handshake.query.token;
      if (!token) {
        return next(new Error("token is required"));
      }
      try {
        const session = await models.Session.findOne({
          token
        });
        if (!session) {
          return next(new Error("authentication error"));
        }
        socket.$accountId = session.accountId.toString();
        next();
      } catch (e) {
        return next(new Error("authentication error"));
      }
    });
    ChatNamespace.on("connect", async socket => {
      try {
        await models.WebSocketConnection.create({
          accountId: socket.$accountId,
          socketId: socket.id
        });
        
        /*
        * Socket handlers
        * */
        socket.on("disconnect", async () => {
          await models.WebSocketConnection.deleteOne({
            accountId: socket.$accountId,
            socketId: socket.id
          });
        });
      } catch (e) {
        console.error(e);
      }
    });
    return io;
  }
});

module.exports.emitChatNotification = wrapServiceAction({
  params: {
    $$strict: "remove",
    socketId: { ...string },
    event: { ...string },
    payload: { type: "any" }
  },
  async handler (params) {
    const socket = ChatNamespace.connected[params.socketId];
    if (!socket) {
      return false;
    }
    socket.emit(params.event, params.payload);
    return true;
  }
});


