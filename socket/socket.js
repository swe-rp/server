const io = require("socket.io");
const utils = require("../common/utils.js");

module.exports = (serverObject) => {
  let server = io(serverObject, {
    path: "/chat"
  });
  server.on("connection", () => {
    utils.log("IO connection.");
  });
};
