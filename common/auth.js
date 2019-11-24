const UserModel = require("../models/user");
const utils = require("./utils");

let verifyUserCredentials = async (userId, token) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    utils.error("User doesn't exist.");
    throw new Error("User does not exist.");
  }

  if (user.accessToken !== token) {
    utils.error("Access token mismatch.");
    throw new Error("Unauthorized.");
  }
};

let middleware = async (req, res, next) => {
  if (req.header("accessToken") || req.header("userId")) {
    throw new Error("Missing authorization headers.");
  }
  await verifyUserCredentials(req.header("userId"), req.header("accessToken"));

  utils.log("User verified.");
  next();
};

module.exports = {
  middleware
};
