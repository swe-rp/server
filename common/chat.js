const notification = require("./notification.js");
const EventModel = require("../models/event.js");
const MessageModel = require("../models/message.js");
const UserModel = require("../models/user.js");

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

let writeMessage = async (event, userId, message) => {
  let user = getUser(userId);

  let message = await MessageModel.create({
    username: user.name,
    user,
    message,
    timestamp: new Date()
  });

  let updated = await EventModel.update(
    { _id: event._id },
    { $push: { chatMessages: message } }
  );

  if (!updated) {
    throw new Error("Event couldn't be updated.");
  }
};

// let ioHandler = async (data) => {
//   await handleMessage(data.eventId, data.userId, data.message);
// };

let notifyMessage = async (event, message) => {
  await notification.sendNotification(event._id, {
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
let handleMessage = async (eventId, userId, message) => {
  let event = getEvent(eventId);
  await writeMessage(event, userId, message);
  await notifyMessage(event, message);
};

let getChatHistory = async (eventId) => {
  let event = getEvent(eventId);

  let messages = event.chatMessages.map((e) => {
    return {
      username: e.username,
      message: e.message,
      timestamp: e.timestamp
    };
  });

  return {
    id: event._id,
    data: messages
  };
};

module.exports = {
  handleMessage,
  getChatHistory
};
