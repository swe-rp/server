const UserModel = require("../models/user");
const utils = require("./utils");

let doesUserExist = async (userId) => {
  try {
    let user = await UserModel.findById(userId);
    utils.log("User", userId, "exists.");
    return user !== null;
  } catch (err) {
    utils.log("User does not exist or error for", userId);
    return false;
  }
};

let userLogin = async (profile, registrationToken) => {
  if (!profile || !registrationToken) {
    throw "Wrong params";
  }

  let existingUser = await UserModel.findOne({ facebookId: profile.id });

  if (existingUser) {
    existingUser.registrationToken = registrationToken;
    await UserModel.findByIdAndUpdate(existingUser.id, existingUser);
    return existingUser;
  }

  let newUser = new UserModel({
    name: profile.displayName,
    email: profile.emails[0].value,
    facebookId: profile.id,
    registrationToken: registrationToken
  });

  await newUser.save();

  return newUser;
};

module.exports = {
  doesUserExist,
  userLogin
};
