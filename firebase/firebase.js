const admin = require("firebase-admin");

let init = () => {
  admin.initializeApp({
    credential: admin.credential.cert(require("./ServiceAccountKey.json"))
  });
};

module.exports = {
  init
};
