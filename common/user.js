const UserModel = require("../models/user");
const utils = require("./utils.js");
const event = require("./event.js");
const notification = require("./notification.js");

const TOKEN_SIZE = 30;

let generateToken = () => {
  let id = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < TOKEN_SIZE; i++) {
    id += characters[Math.floor(Math.random() * characters.length)];
  }
  return id;
};

let getUser = async (userId) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesn't exist.");
  } else {
    return user;
  }
};

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

  let fcmCalls = [];

  let userToRegistrationToken = await UserModel.findOne({
    registrationToken
  });

  if (userToRegistrationToken) {
    utils.debug("Unsubscribing old user.");
    let oldUserEvents = await event.getAttendedEvents(
      userToRegistrationToken.id
    );
    for (let event of oldUserEvents.data) {
      fcmCalls.push(notification.unsubscribeFromTopic(event.id, registrationToken));
    }
  }

  let existingUser = await UserModel.findOne({ facebookId: profile.id });

  if (existingUser) {
    utils.debug("Existing user, subscribing to events.");
    let newUserEvents = await event.getAttendedEvents(existingUser.id);
    for (let event of newUserEvents.data) {
      if (existingUser.registrationToken !== registrationToken) {
        fcmCalls.push(notification.unsubscribeFromTopic(
          event.id,
          existingUser.registrationToken
        ));
      }
      fcmCalls.push(notification.subscribeToTopic(event.id, registrationToken));
    }

    await Promise.all(fcmCalls);

    existingUser.registrationToken = registrationToken;
    existingUser.accessToken = generateToken();
    await UserModel.findByIdAndUpdate(existingUser.id, existingUser);
    utils.log(existingUser);
    return existingUser;
  }

  await Promise.all(fcmCalls);

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

module.exports = {
  getUser,
  doesUserExist,
  userLogin
};
