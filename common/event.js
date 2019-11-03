const EventModel = require("../models/event");

let createEvent = async (body) => {
  let newEvent = new EventModel({
    name: body.name,
    description: body.description,
    host: body.host,
    attendants_list: [body.host],
    startTime: body.startTime,
    endTime: body.endTime,
    tag_list: body.tags
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

let getAvailableEvents = async (userId) => {
  let today = new Date();
  //   let tomorrow = new Date();

  //   tomorrow.setDate(today.getDate() + 1);

  let query = EventModel.find();

  query.where("startTime").gte(today);
  // .lt(tomorrow);
  query.where("attendants_list").nin(userId);

  let allEvents = await query.exec();
  let attendedEvents = await getAttendedEvents(userId);

  let events = attendedEvents
    ? mapSortEventByScore(attendedEvents, allEvents)
    : allEvents;

  return {
    data: events
  };
};

let mapSortEventByScore = (attendedEvents, events) => {
  let tagFreq = {};

  attendedEvents.data.forEach((event) => {
    event.tag_list.forEach((tag) => {
      if (!tagFreq[tag]) {
        tagFreq[tag] = 0;
      }
      tagFreq[tag]++;
    });
  });

  events.map((el) => {
    el.score = getScore(tagFreq, el);
    return el;
  });

  events.sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });

  events.map((el) => {
    delete el.score;
    return el;
  });

  return events;
};

let getUserEvents = async (userId) => {
  let today = new Date();
  //   let tomorrow = new Date();

  //   tomorrow.setDate(today.getDate() + 1);

  let query = EventModel.find();

  query.where("startTime").gte(today);
  // .lt(tomorrow);
  query.where("attendants_list").in(userId);

  let events = await query.exec();

  return {
    data: events
  };
};

let getAttendedEvents = async (userId) => {
  let query = EventModel.find();

  query.where("attendants_list").in(userId);

  let events = await query.exec();

  return {
    data: events
  };
};

let addAttendant = async (id, userId) => {
  let event = await EventModel.findById(id);

  event.attendants_list.push(userId);

  let update = {
    attendants_list: event.attendants_list
  };

  let updated = await EventModel.findByIdAndUpdate(id, update);

  return {
    id: updated.id,
    data: updated
  };
};

let removeAttendant = async (id, userId) => {
  let event = await EventModel.findById(id);

  let newList = event.attendants_list.filter((e) => {
    // This is required since we have different escape characters
    return JSON.stringify(e) !== JSON.stringify(userId);
  });

  let update = {
    attendants_list: newList
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

  let tagFreq = {};

  attendedEvents.forEach((event) => {
    event.tag_list.forEach((tag) => {
      if (!tagFreq[tag]) {
        tagFreq[tag] = 0;
      }
      tagFreq[tag]++;
    });
  });

  let bestEvent = events[0];
  let bestScore = getScore(tagFreq, bestEvent);

  for (let i = 0; i < events.length; i++) {
    let score = getScore(tagFreq, events[i]);
    if (score > bestScore) {
      bestEvent = events[i];
      bestScore = score;
    }
  }

  return {
    data: bestEvent
  };
};

let getScore = (tagFreq, event) => {
  let score = 0;

  event.tag_list.forEach((tag) => {
    if (tagFreq[tag]) {
      score += 5 * tagFreq[tag];
    }
  });

  return score;
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
