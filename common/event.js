const EventModel = require("../models/event");
const notifications = require("./notification.js");
const retext = require("retext");
const pos = require("retext-pos");
const keywords = require("retext-keywords");
const toString = require("nlcst-to-string");
const utils = require("../common/utils.js");
const getters = require("./getters.js");

const TAG_MULTIPLIER = 8;
const KEY_MULTIPLIER = 4;
const TIME_MULTIPLIER = 40;
const TIME_FACTOR = 1000 * 3600 * 144;
const LOCATION_MULTIPLIER = 30;

let verifyParams = (body) => {
  if (
    body.name &&
    body.description &&
    body.host &&
    body.startTime &&
    body.endTime &&
    body.location
  ) {
    if (new Date(body.endTime) - new Date(body.startTime) < 0) {
      throw new Error("Parameters are malformed!");
    }
  } else {
    throw new Error("Parameters are malformed!");
  }
};

let mapEventToUserId = async (events) => {
  let readableEvents = [];

  for (let event of events) {
    let eventJSON = event.toJSON();
    let user = { name: "Anonymous" };
    try {
      user = await getters.getUser(event.host);
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
    tagList
  });

  await newEvent.save();

  try {
    let user = await getters.getUser(body.host);
    if (user.registrationToken) {
      notifications.subscribeToTopic(newEvent.id, user.registrationToken);
    }
  } catch (err) {
    utils.error("The host wasn't valid, but event created.");
  }

  return {
    id: newEvent.id,
    data: newEvent
  };
};

let updateEvent = async (id, body, userId) => {
  let event = await getters.getEvent(id);

  if (JSON.stringify(event.host) !== JSON.stringify(userId)) {
    throw new Error("You aren't the host!");
  }

  let tagList = body.tagList || event.tagList;

  try {
    tagList = JSON.parse(body.tagList);
    utils.debug("Event tag list came as JSON.");
  } catch (e) {
    utils.debug("Event tag list didn't come as a JSON.");
  }

  let update = {
    name: body.name || event.name,
    description: body.description || event.description,
    host: body.host || event.host,
    location: body.location || event.location,
    startTime: body.startTime || event.startTime,
    endTime: body.endTime || event.endTime,
    tagList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update, { new: true });

  notifications.sendNotification(updated.id, {
    title: `${event.name} updated!`,
    body: "Check it out in the app."
  });

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
  let tagScore = 0;
  let keyScore = 0;
  let timeScore = 0;
  let locationScore = 0;

  // tags
  event.tagList.forEach((tag) => {
    if (tagFreq.has(tag)) {
      tagScore += TAG_MULTIPLIER * tagFreq.get(tag);
    }
  });

  // keywords
  let eventDescription = event.description.toLowerCase();

  keyFreq.forEach((e, key) => {
    if (eventDescription.includes(key)) {
      keyScore += KEY_MULTIPLIER * keyFreq.get(key);
    }
  });

  // time
  let timeDiff = event.startTime.getTime() - Date.now();

  if (!isNaN(timeDiff)) {
    timeScore += TIME_MULTIPLIER * Math.exp(-timeDiff / TIME_FACTOR);
  }

  // location
  try {
    let userLocationArr = userLocation.split(",").map((e) => parseFloat(e));
    let eventLocationArr = event.location.split(",").map((e) => parseFloat(e));
    let locationDiff =
      Math.pow(userLocationArr[0] - eventLocationArr[0], 2) +
      Math.pow(userLocationArr[1] - eventLocationArr[1], 2);

    if (!isNaN(locationDiff)) {
      locationScore += LOCATION_MULTIPLIER * Math.exp(-locationDiff);
    }
  } catch (err) {
    utils.error("Error with location, skipping.");
  }

  let score = tagScore + keyScore + timeScore + locationScore;

  utils.debug("For event:", event.name);
  utils.debug("Tags:", event.tagList);
  utils.debug("Description:", event.description);
  utils.debug("Total Score:", score);
  utils.debug({
    tag: tagScore,
    key: keyScore,
    time: timeScore,
    location: locationScore
  });

  return score;
};

let keywordAnalysis = (description) => {
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
    let data = await keywordAnalysis(event.description);

    utils.debug(`Keywords for ${event.name}`);

    data.data.keywords.forEach((kw) => {
      let keyword = toString(kw.matches[0].node).toLowerCase();

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
  let user = await getters.getUser(userId);

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
  let user = await getters.getUser(userId);

  let today = new Date();

  let query = EventModel.find();

  query.where("startTime").gte(today);
  query.where("attendantsList").in(userId);

  let userEvents = await query.exec();

  let events = await mapEventToUserId(userEvents);

  return {
    data: events
  };
};

let addAttendant = async (id, userId) => {
  let event = await getters.getEvent(id);

  let user = await getters.getUser(userId);

  event.attendantsList.push(userId);

  let update = {
    attendantsList: event.attendantsList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update, { new: true });

  if (user.registrationToken) {
    notifications.subscribeToTopic(event.id, user.registrationToken);
  }

  return {
    id: updated.id,
    data: updated
  };
};

let removeAttendant = async (id, userId) => {
  let event = await getters.getEvent(id);

  let user = await getters.getUser(userId);

  let newList = event.attendantsList.filter((e) => {
    // This is required since we have different escape characters
    return JSON.stringify(e) !== JSON.stringify(userId);
  });

  let update = {
    attendantsList: newList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update, { new: true });

  if (user.registrationToken) {
    notifications.unsubscribeFromTopic(event.id, user.registrationToken);
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
  let event = await getters.getEvent(id);

  await getters.getUser(userId);

  if (JSON.stringify(event.host) !== JSON.stringify(userId)) {
    throw new Error("You're not the host!");
  }

  let deletedEvent = {
    id: event.id,
    name: event.name
  };

  await EventModel.findByIdAndDelete(event.id);

  notifications.sendNotification(id, {
    title: `${deletedEvent.name} deleted!`,
    body: "Sorry about that."
  });
};

module.exports = {
  createEvent,
  updateEvent,
  getAvailableEvents,
  getUserEvents,
  getAttendedEvents,
  addAttendant,
  removeAttendant,
  suggestEvent,
  deleteEvent
};
