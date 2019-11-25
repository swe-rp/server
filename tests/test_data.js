const mongoose = require("mongoose");

const GLOBAL_USER_ID = mongoose.Types.ObjectId();

let completeEvent = {
  name: "event",
  description: "event description",
  host: GLOBAL_USER_ID,
  location: "loc",
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

let eventArray = [
  {
    _id: mongoose.Types.ObjectId(),
    name: "event1",
    description: "event description",
    host: GLOBAL_USER_ID,
    attendantsList: [GLOBAL_USER_ID],
    startTime: "12323232",
    endTime: "12323232",
    tagList: ["fun", "social"]
  }
];

let userArray = [
  {
    name: "Sam",
    facebookId: "1",
    registrationToken: "randomToken"
  },
  {
    name: "Dry",
    facebookId: "2",
    registrationToken: "anotherRandomToken"
  },
  {
    name: "Test",
    facebookId: "3",
    registrationToken: "yetAnotherToken"
  }
];

module.exports = {
  completeEvent: completeEvent,
  incompleteEvent: incompleteEvent,
  user: user
};
