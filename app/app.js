const express = require("express");
const app = express();
const utils = require("../common/utils.js");

app.use(express.json());

// Endpoint hit logging
app.use((req, res, next) => {
  utils.log(req.method, req.originalUrl);
  next();
});

// Route setup
app.use("/users", require("./routes/users"));
app.use("/events", require("./routes/events"));

// Failure catch
app.use((err, req, res, next) => {
  utils.error("Cannot", req.method, req.originalUrl);
  res.status(500).send("Failed to call API.");
});

// Splash
app.get("/", function(req, res) {
  res.send("Welcome to evnt's API.");
});

module.exports = app;