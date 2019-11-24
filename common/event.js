const EventModel = require("../models/event");
const UserModel = require("../models/user");
const notifications = require("./notification.js");

const EVENT_MULTIPLIER = 5;

let getEvent = async (eventId) => {
  let event = await EventModel.findById(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  return event;
};

let verifyParams = (body) => {
  if (
    !body.name ||
    !body.description ||
    !body.host ||
    !body.startTime ||
    !body.endTime ||
    !body.location
  ) {
    throw new Error("Wrong params");
  }
};

let createEvent = async (body) => {
  verifyParams(body);

  let newEvent = new EventModel({
    name: body.name,
    description: body.description,
    host: body.host,
    location: body.location,
    attendantsList: body.attendantsList || [body.host],
    startTime: body.startTime,
    endTime: body.endTime,
    tagList: body.tagList
  });

  await newEvent.save();

  let user = await UserModel.findById(body.host);

  if (user && user.registrationToken) {
    await notifications.subscribeToTopic(newEvent.id, user.registrationToken);
  }

  return {
    id: newEvent.id,
    data: newEvent
  };
};

let updateEvent = async (id, body, userId) => {
  let event = await EventModel.findById(id);

  if (!event) {
    throw new Error("Event does not exist");
  }

  if (JSON.stringify(event.host) !== JSON.stringify(userId)) {
    throw new Error("You aren't the host!");
  }

  let update = {
    name: body.name || event.name,
    description: body.description || event.description,
    host: body.host || event.host,
    location: body.location || event.location,
    startTime: body.startTime || event.startTime,
    endTime: body.endTime || event.endTime,
    tagList: body.tagList || event.tagList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update, { new: true });

  if (!updated) {
    throw new Error("Event does not exist");
  }

  return {
    id: updated.id,
    data: updated
  };
};

let getAttendedEvents = async (userId) => {
  let query = EventModel.find();

  query.where("attendantsList").in(userId);

  let events = await query.exec();

  return {
    data: events
  };
};

/**
 * Just a placeholder to specify type.
 * @param {Map} tagFreq
 * @param {*} event
 */
let getScore = (tagFreq, event) => {
  let score = 0;

  event.tagList.forEach((tag) => {
    if (tagFreq.has(tag)) {
      score += EVENT_MULTIPLIER * tagFreq.get(tag);
    }
  });

  return score;
};

let mapSortEventByScore = (attendedEvents, events) => {
  let tagFreq = new Map();

  attendedEvents.data.forEach((event) => {
    event.tagList.forEach((tag) => {
      if (!tagFreq.has(tag)) {
        tagFreq.set(tag, 0);
      }
      let count = tagFreq.get(tag) + 1;
      tagFreq.set(tag, count);
    });
  });

  events.map((el) => {
    el.score = getScore(tagFreq, el);
    return el;
  });

  events.sort((a, b) => {
    if (a.score > b.score) {
      return -1;
    }
    if (a.score < b.score) {
      return 1;
    }
    return 0;
  });

  events.map((el) => {
    delete el.score;
    return el;
  });

  return events;
};

let getAvailableEvents = async (userId) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesnt exist");
  }

  let today = new Date();
  //   let tomorrow = new Date();

  //   tomorrow.setDate(today.getDate() + 1);

  let query = EventModel.find();

  query.where("startTime").gte(today);
  // .lt(tomorrow);
  query.where("attendantsList").nin(userId);

  let allEvents = await query.exec();
  let attendedEvents = await getAttendedEvents(userId);

  let events = mapSortEventByScore(attendedEvents, allEvents);

  return {
    data: events
  };
};

let getUserEvents = async (userId) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesnt exist");
  }

  let today = new Date();
  //   let tomorrow = new Date();

  //   tomorrow.setDate(today.getDate() + 1);

  let query = EventModel.find();

  query.where("startTime").gte(today);
  // .lt(tomorrow);
  query.where("attendantsList").in(userId);

  let events = await query.exec();

  return {
    data: events
  };
};

let addAttendant = async (id, userId) => {
  let event = await EventModel.findById(id);
  if (!event) {
    throw new Error("Event doesnt exist");
  }

  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesnt exist");
  }

  event.attendantsList.push(userId);

  let update = {
    attendantsList: event.attendantsList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update, { new: true });

  if (user && user.registrationToken) {
    await notifications.subscribeToTopic(event.id, user.registrationToken);
  }

  return {
    id: updated.id,
    data: updated
  };
};

let removeAttendant = async (id, userId) => {
  let event = await EventModel.findById(id);
  if (!event) {
    throw new Error("Event doesnt exist");
  }

  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesnt exist");
  }

  let newList = event.attendantsList.filter((e) => {
    // This is required since we have different escape characters
    return JSON.stringify(e) !== JSON.stringify(userId);
  });

  let update = {
    attendantsList: newList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update, { new: true });

  if (user && user.registrationToken) {
    await notifications.unsubscribeFromTopic(event.id, user.registrationToken);
  }

  return {
    id: updated.id,
    data: updated
  };
};

let suggestEvent = async (userId) => {
  let events = (await getAvailableEvents(userId)).data;

  if (events.length === 0) {
    throw new Error("No events");
  }

  return {
    data: events[0]
  };
};

let deleteEvent = async (id, userId) => {
  let event = await EventModel.findById(id);

  if (!event) {
    throw new Error("Event doesnt exist");
  }

  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesnt exist");
  }

  if (JSON.stringify(event.host) !== JSON.stringify(userId)) {
    throw new Error("You're not the host!");
  }

  await EventModel.findByIdAndDelete(event.id);
};

module.exports = {
  createEvent,
  updateEvent,
  getAvailableEvents,
  getUserEvents,
  addAttendant,
  removeAttendant,
  suggestEvent,
  deleteEvent,
  getEvent
};
