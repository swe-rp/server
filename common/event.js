const EventModel = require("../models/event");
const UserModel = require("../models/user");
const User = require("./user.js");
const notifications = require("./notification.js");
const retext = require("retext");
const pos = require("retext-pos");
const keywords = require("retext-keywords");
const toString = require("nlcst-to-string");
const utils = require("../common/utils.js");
const { performance } = require("perf_hooks");

const TAG_MULTIPLIER = 10;
const KEY_MULTIPLIER = 1;
const TIME_MULTIPLIER = 5;
const LOCATION_MULTIPLIER = 5.0;

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

let mapEventToUserId = async (events) => {
  let readableEvents = [];

  for (let event of events) {
    let eventJSON = event.toJSON();
    let user = { name: "Anonymous" };
    try {
      user = await User.getUser(event.host);
    } catch (e) {
      utils.debug(e);
    }
    eventJSON.hostname = user.name;
    readableEvents.push(eventJSON);
  }

  return readableEvents;
};

let createEvent = async (body) => {
  verifyParams(body);

  let tagList = body.tagList;

  try {
    tagList = JSON.parse(body.tagList);
    utils.debug("Event tag list came as JSON.");
  } catch (e) {
    utils.debug("Event tag list didn't come as a JSON.");
  }

  let newEvent = new EventModel({
    name: body.name,
    description: body.description,
    host: body.host,
    location: body.location,
    attendantsList: body.attendantsList || [body.host],
    startTime: body.startTime,
    endTime: body.endTime,
    tagList: tagList
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
 * @param {Map} keyFreq
 * @param {*} event
 */
let getScore = (tagFreq, keyFreq, userLocation, event) => {
  let score = 0;

  // tags
  event.tagList.forEach((tag) => {
    if (tagFreq.has(tag)) {
      score += TAG_MULTIPLIER * tagFreq.get(tag);
    }
  });

  // keywords
  let eventDescription = event.description.toLowerCase();

  keyFreq.forEach((e, key) => {
    let occurences = (eventDescription.match(new RegExp(key, "g")) || [])
      .length;
    score += KEY_MULTIPLIER * (keyFreq.get(key) + occurences);
  });

  // time
  let timeDiff = event.startTime.getTime() - performance.now();

  if (!isNaN(timeDiff)) {
    score += TIME_MULTIPLIER * Math.exp(-timeDiff);
  }

  // location
  try {
    let userLocationArr = userLocation.split(",").map((e) => parseFloat(e));
    let eventLocationArr = event.location.split(",").map((e) => parseFloat(e));
    let locationDiff =
      Math.pow(userLocationArr[0] - eventLocationArr[0], 2) +
      Math.pow(userLocationArr[1] - eventLocationArr[1], 2);

    if (!isNaN(locationDiff)) {
      score += LOCATION_MULTIPLIER * Math.exp(-locationDiff);
    }
  } catch (err) {
    utils.error("Error with locations", err);
  }

  utils.debug("Score", score);

  return score;
};

let tagAnalysis = (description) => {
  return new Promise((resolve, reject) => {
    retext()
      .use(pos)
      .use(keywords)
      .process(description, (err, done) => {
        if (err) {
          reject(err);
        }
        resolve(done);
      });
  });
};

let mapSortEventByScore = async (attendedEvents, events, userLocation) => {
  let tagFreq = new Map();
  let keyFreq = new Map();

  // Consider the tags first
  attendedEvents.data.forEach((event) => {
    event.tagList.forEach((tag) => {
      if (!tagFreq.has(tag)) {
        tagFreq.set(tag, 0);
      }
      let count = tagFreq.get(tag) + 1;
      tagFreq.set(tag, count);
    });
  });

  // Consider the keywords next
  for (let event of attendedEvents.data) {
    let data = await tagAnalysis(event.description);

    utils.debug(`Keywords for ${event.name}`);

    data.data.keywords.forEach((kw) => {
      let keyword = toString(kw.matches[0].node);

      utils.debug(keyword);

      if (!keyFreq.has(keyword)) {
        keyFreq.set(keyword, 0);
      }

      let count = keyFreq.get(keyword) + 1;
      keyFreq.set(keyword, count);
    });
  }

  events.map((el) => {
    el.score = getScore(tagFreq, keyFreq, userLocation, el);
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

let getAvailableEvents = async (userId, userLocation) => {
  let user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User doesnt exist");
  }

  let today = new Date();

  let query = EventModel.find();

  query.where("startTime").gte(today);
  query.where("attendantsList").nin(userId);

  let allEvents = await query.exec();
  let attendedEvents = await getAttendedEvents(userId);

  let scoredEvents = await mapSortEventByScore(
    attendedEvents,
    allEvents,
    userLocation
  );

  let events = await mapEventToUserId(scoredEvents);

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

  let userEvents = await query.exec();

  let events = await mapEventToUserId(userEvents);

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

let suggestEvent = async (userId, userLocation) => {
  let events = (await getAvailableEvents(userId, userLocation)).data;

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
