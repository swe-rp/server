const EventModel = require("../models/event");
const UserModel = require("../models/user");

let getEvent = async (eventId) => {
  let event = await EventModel.findById(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  return event;
};

let getUser = async (userId) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesn't exist.");
  } else {
    return user;
  }
};

module.exports = {
  getEvent,
  getUser
};
