const notification = require("./notification.js");
const EventModel = require("../models/event.js");
const UserModel = require("../models/user.js");
const utils = require("./utils.js");

let getEvent = async (eventId) => {
  let event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error("Event doesn't exist.");
  } else {
    return event;
  }
};

let getUser = async (userId) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesn't exist.");
  } else {
    return user;
  }
};

let writeMessage = async (event, userId, message, timestamp) => {
  let user = await getUser(userId);

  let updated = await EventModel.findByIdAndUpdate(
    { _id: event._id },
    {
      $push: {
        chatMessages: {
          username: user.name,
          user,
          message,
          timestamp
        }
      }
    }
  );

  if (!updated) {
    throw new Error("Event couldn't be updated.");
  }
};

// let ioHandler = async (data) => {
//   await handleMessage(data.eventId, data.userId, data.message);
// };

let notifyMessage = async (event, message) => {
  await notification.sendNotification(event.id, {
    title: `New message from event ${event.name}`,
    body: message
  });
};

/**
 * This function handles a message by writing a message to the
 * event's DB entry, and sending a notification to everybody
 * subscribed to this eventId.
 * @param {*} message
 */
let handleMessage = async (eventId, userId, message, timestamp) => {
  let event = await getEvent(eventId);
  await writeMessage(event, userId, message, timestamp);
  await notifyMessage(event, message);
};

let getChatHistory = async (eventId) => {
  let event = await getEvent(eventId);

  let messages = event.chatMessages.map((e) => {
    return {
      username: e.username,
      message: e.message,
      timestamp: e.timestamp
    };
  });

  return {
    id: event.id,
    data: messages
  };
};

module.exports = {
  handleMessage,
  getChatHistory
};
