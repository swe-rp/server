const mongoose = require("mongoose");
const utils = require("../common/utils.js");

let init = () => {
  return mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then((res) => utils.log("Connection to MongoDB successful."))
    .catch((err) => utils.log("Connection to MongoDB failed.", err));
};

module.exports = {
  init
};
