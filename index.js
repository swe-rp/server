const fs = require("fs");
const https = require("https");
const utils = require("./common/utils");
const db = require("./db/mongoose.js");
const fb = require("./firebase/firebase.js");
const app = require("./app/app.js");

utils.log("Initializing database.");

db.init();

utils.log("Initializing firebase.");

fb.init();

utils.log("Setting up listener.");

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
