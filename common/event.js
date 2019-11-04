const EventModel = require("../models/event");

let createEvent = async (body) => {
  let newEvent = new EventModel({
    name: body.name,
    description: body.description,
    host: body.host,
    attendantsList: [body.host],
    startTime: body.startTime,
    endTime: body.endTime,
    tagList: body.tags
  });

  await newEvent.save();

  return {
    id: newEvent.id,
    data: newEvent
  };
};

let updateEvent = async (id, body) => {
  let update = {
    name: body.name,
    description: body.description,
    host: body.host,
    startTime: body.startTime,
    endTime: body.endTime
  };

  let updated = await EventModel.findByIdAndUpdate(id, update);

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
      score += 5 * tagFreq.get(tag);
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
  let today = new Date();
  //   let tomorrow = new Date();

  //   tomorrow.setDate(today.getDate() + 1);

  let query = EventModel.find();

  query.where("startTime").gte(today);
  // .lt(tomorrow);
  query.where("attendantsList").nin(userId);

  let allEvents = await query.exec();
  let attendedEvents = await getAttendedEvents(userId);

  let events = attendedEvents
    ? mapSortEventByScore(attendedEvents, allEvents)
    : allEvents;

  return {
    data: events
  };
};

let getUserEvents = async (userId) => {
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

  event.attendantsList.push(userId);

  let update = {
    attendantsList: event.attendantsList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update);

  return {
    id: updated.id,
    data: updated
  };
};

let removeAttendant = async (id, userId) => {
  let event = await EventModel.findById(id);

  let newList = event.attendantsList.filter((e) => {
    // This is required since we have different escape characters
    return JSON.stringify(e) !== JSON.stringify(userId);
  });

  let update = {
    attendantsList: newList
  };

  let updated = await EventModel.findByIdAndUpdate(id, update);

  return {
    id: updated.id,
    data: updated
  };
};

let suggestEvent = async (userId) => {
  let events = getAvailableEvents(userId).data;
  let attendedEvents = getAttendedEvents(userId).data;

  let tagFreq = new Map();

  attendedEvents.forEach((event) => {
    event.tagList.forEach((tag) => {
      if (!tagFreq.has(tag)) {
        tagFreq.set(tag, 0);
      }
      let count = tagFreq.get(tag) + 1;
      tagFreq.set(tag, count);
    });
  });

  let bestEvent = events[0];
  let bestScore = getScore(tagFreq, bestEvent);

  events.map((event) => {
    let score = getScore(tagFreq, event);
    if (score > bestScore) {
      bestEvent = event;
      bestScore = score;
    }
  });

  return {
    data: bestEvent
  };
};

module.exports = {
  createEvent,
  updateEvent,
  getAvailableEvents,
  getUserEvents,
  addAttendant,
  removeAttendant,
  suggestEvent
};
