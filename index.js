const express = require("express");
const app = express();
const fs = require("fs");
const https = require("https");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const utils = require("./common/utils");

// DB init
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then((res) => utils.log("Connection to MongoDB successful."))
  .catch((err) => utils.log("Connection to MongoDB failed.", err));

// Firebase Admin init
admin.initializeApp({
  credential: admin.credential.cert(require("./ServiceAccountKey.json"))
});

// Express init
app.use(express.json());
app.use((req, res, next) => {
  utils.log(req.method, req.originalUrl);
  next();
});
app.use("/users", require("./routes/users"));
app.use("/events", require("./routes/events"));
app.use((err, req, res, next) => {
  utils.error("Cannot", req.method, req.originalUrl);
  res.status(500).send("Failed to call API.");
});
// app.use("/plans", require("./routes/plans"));
// app.use("/messages", require("./routes/messages"));

https
  .createServer(
    {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    },
    app
  )
  .listen(process.env.PORT);

app.get("/", function(req, res) {
  res.send("Welcome to evnt's API.");
});
