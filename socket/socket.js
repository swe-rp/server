const io = require("socket.io");
const utils = require("../common/utils.js");

io.on("connection", () => {
    utils.log("IO connection.");
});

module.exports = io;