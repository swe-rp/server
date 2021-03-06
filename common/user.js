const UserModel = require("../models/user");
const utils = require("./utils.js");
const event = require("./event.js");
const notification = require("./notification.js");

const TOKEN_SIZE = 30;
const NULL_TOKEN = "NULL";
const EVENT_TOPIC = "event";

let generateToken = () => {
  let id = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < TOKEN_SIZE; i++) {
    id += characters[Math.floor(Math.random() * characters.length)];
  }
  return id;
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
    throw new Error("Parameters are malformed!");
  }

  let userToRegistrationToken = await UserModel.findOne({
    registrationToken
  });

  let existingUser = await UserModel.findOne({ facebookId: profile.id });

  notification.subscribeToTopic(EVENT_TOPIC, registrationToken);

  let unsubscriptionPromises = [];

  if (userToRegistrationToken) {
    utils.debug("Unsubscribing old user.");
    let oldUserEvents = await event.getAttendedEvents(
      userToRegistrationToken.id
    );

    userToRegistrationToken.registrationToken = NULL_TOKEN;
    await UserModel.findByIdAndUpdate(
      userToRegistrationToken.id,
      userToRegistrationToken
    );

    for (let event of oldUserEvents.data) {
      unsubscriptionPromises.push(
        notification.unsubscribeFromTopic(event.id, registrationToken)
      );
    }
  }

  await Promise.all(unsubscriptionPromises);

  if (existingUser) {
    utils.debug("Existing user, subscribing to events.");
    let newUserEvents = await event.getAttendedEvents(existingUser.id);
    for (let event of newUserEvents.data) {
      notification.subscribeToTopic(event.id, registrationToken);
    }

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

module.exports = {
  doesUserExist,
  userLogin
};
