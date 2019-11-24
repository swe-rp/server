const UserModel = require("../models/user");
const utils = require("./utils");

const TOKEN_SIZE = 30;

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
    existingUser.accessToken = generateToken();
    await UserModel.findByIdAndUpdate(existingUser.id, existingUser);
    utils.log(existingUser);
    return existingUser;
  }

  let newUser = new UserModel({
    name: profile.displayName,
    email: profile.emails[0].value,
    facebookId: profile.id,
    registrationToken,
    accessToken: generateToken()
  });

  await newUser.save();

  utils.log(newUser);

  return newUser;
};

let generateToken = () => {
  id = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < TOKEN_SIZE; i++) {
    id += characters[Math.floor(Math.random() * characters.length)];
  }
  return id;
};

module.exports = {
  doesUserExist,
  userLogin
};
