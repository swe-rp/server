const mongoose = require("mongoose");

const GLOBAL_USER_ID = mongoose.Types.ObjectId();

let completeEvent = {
  name: "event",
  description: "event description",
  host: GLOBAL_USER_ID,
  location: "1,1",
  attendantsList: [GLOBAL_USER_ID],
  startTime: 12323232,
  endTime: 12323232,
  tagList: ["fun", "social"]
};

let incompleteEvent = {
  name: "event",
  description: "event description",
  host: GLOBAL_USER_ID,
  attendantsList: [GLOBAL_USER_ID],
  startTime: "12323232",
  tagList: ["fun", "social"]
};

let user = {
  name: "Sam",
  facebookId: "1",
  registrationToken: "randomToken",
  accessToken: "access"
};

let user2 = {
  name: "Darth",
  facebookId: "2",
  registrationToken: "fff",
  accessToken: "access2"
};

module.exports = {
  completeEvent,
  incompleteEvent,
  user,
  user2
};
