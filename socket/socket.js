const io = require("socket.io");
const utils = require("../common/utils.js");
const UserModel = require("../models/user.js");
const chat = require("../common/chat.js");

module.exports = (serverObject) => {
  let server = io(serverObject, {
    path: "/chat/live"
  });
  server.on("connection", (socket) => {
    utils.log("IO connection.");
    socket.on("join", (data) => {
      socket.join(data.eventId);
    });
    socket.on("message", async (data) => {
      let eventId = data.eventId;
      let user = await UserModel.findById(data.userId);
      socket.to(eventId).emit("message", {
        username: user.name,
        userId: user.id,
        timestamp: new Date(),
        message: data.message
      });
      await chat.handleMessage(eventId, user.id, data.message, new Date());
    });
  });
};
