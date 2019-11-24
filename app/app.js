const express = require("express");
const path = require("path");
const app = express();
const utils = require("../common/utils.js");

app.use(express.json());

// Endpoint hit logging
app.use((req, res, next) => {
  utils.log(req.method, req.originalUrl);
  next();
});

// Route setup
app.use("/users", require("../routes/users"));
app.use("/events", require("../routes/events"));
app.use("/chat", require("../routes/chat"));

// Static assets setup
app.set("views", path.join(__dirname, "../public"));
app.set("view engine", "hjs");

// Failure catch
app.use((err, req, res, next) => {
  utils.error("Cannot", req.method, req.originalUrl);
  utils.error(err);
  res.status(500).send(err);
});

// Splash
app.get("/", function(req, res) {
  res.send("Welcome to evnt's API.");
});

module.exports = app;
