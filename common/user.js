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
  let existingUser = await User.findOne({ facebookId: profile.id });

  if (existingUser) {
    existingUser.registrationToken = registrationToken;
    await User.findByIdAndUpdate(existingUser.id, existingUser);
    return existingUser;
  }

  let newUser = new User({
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
