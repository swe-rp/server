// Tests the event controller

// Functions tested
//     - POST /api
//     - PUT /api/add/:id/:userId
//     - PUT /api/remove/:id/:userId
//     - PUT /api/:
//     - GET /api/avail/:userId
//     - GET /api/in/:userId
//     - GET /api/suggest/:userId
//     - GET /notify/:topic

const TestData = require("./test_data");
const request = require("supertest");
const app = require("../app/app.js");
const db = require("../db/mongoose.js");
const mongoose = require("mongoose");
const EventModel = require("../models/event");
const UserModel = require("../models/user");
const utils = require("../common/utils.js");

const admin = require("firebase-admin");

jest.mock("firebase-admin", () => {
  return {
    messaging: jest.fn().mockReturnValue({
      send: (e) => {
        if (e.topic) {
          if (e.topic === "fail") {
            return Promise.reject("fail");
          } else {
            return Promise.resolve(e.topic);
          }
        } else {
          return Promise.reject("no topic");
        }
      },
      subscribeToTopic: (token, topic) => {
        if (topic) {
          return Promise.resolve(topic);
        } else {
          return Promise.reject("no topic");
        }
      }
    })
  };
});

// Supress the logging
jest.mock("../common/utils.js", () => {
  return {
    log: (e) => {},
    error: (e) => {}
  };
});

// Sanitize our events to a string
let createExpectedReturn = (event) => {
  let expectedEvent = Object.assign({}, event);
  expectedEvent.startTime = new Date(event.startTime).toISOString();
  expectedEvent.endTime = new Date(event.endTime).toISOString();
  expectedEvent.host = event.host.toString();
  expectedEvent.attendantsList = event.attendantsList.map((e) => e.toString());
  delete expectedEvent._id;
  return expectedEvent;
};

describe("routes/event.js tests", () => {
  let userId;
  let eventId;

  beforeAll(async () => {
    try {
      await db.init();
    } catch (e) {
      process.exit();
    }
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
    let testUser = new UserModel(TestData.user);
    testUser = await testUser.save();
    userId = testUser._id;

    let testEvent = new EventModel(TestData.completeEvent);
    testEvent = await testEvent.save();
    eventId = testEvent._id;
  });

  test("create event and returns successfully", (done) => {
    request(app)
      .post("/events/api")
      .send(TestData.completeEvent)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toMatchObject(
          createExpectedReturn(TestData.completeEvent)
        );
        done();
      });
  });

  test("throw error when creating event with missing information", (done) => {
    request(app)
      .post("/events/api")
      .send(TestData.incompleteEvent)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("add user to existing event and return successfully", (done) => {
    let expectedReturn = createExpectedReturn(TestData.completeEvent);
    expectedReturn.attendantsList.push(userId.toString());
    request(app)
      .put(`/events/api/add/${eventId}/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toMatchObject(expectedReturn);
        done();
      });
  });

  test("throw error when adding user to unexisting event", (done) => {
    request(app)
      .put(`/events/api/add/missing/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("throw error when adding unexisting user", (done) => {
    request(app)
      .put(`/events/api/add/${eventId}/missing`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("remove user from existing event and return successfully", (done) => {
    request(app)
      .put(`/events/api/remove/${eventId}/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toMatchObject(
          createExpectedReturn(TestData.completeEvent)
        );
        done();
      });
  });

  test("throw error when removing user from unexisting event", (done) => {
    request(app)
      .put(`/events/api/remove/missing/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("update event and returns successfully", (done) => {
    let updated = Object.assign({}, TestData.completeEvent);
    updated.description = "new description";
    let expectedReturn = createExpectedReturn(updated);
    request(app)
      .put(`/events/api/${eventId}`)
      .send(updated)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toMatchObject(expectedReturn);
        done();
      });
  });

  test("throw error when updating event with missing information", (done) => {
    let updated = Object.assign({}, TestData.completeEvent);
    updated.description = null;
    request(app)
      .put(`/events/api/${eventId}`)
      .send(updated)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("get available events and return successfully", async (done) => {
    let testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["fun"];
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    testEvent.startTime = tomorrow;
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["sports"];
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    testEvent.startTime = yesterday;
    testEvent.attendantsList.push(userId);
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["sports"];
    testEvent.startTime = yesterday;
    testEvent.attendantsList.push(userId);
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["toys"];
    testEvent.startTime = tomorrow;
    testEvent.attendantsList.push(userId);
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["sports"];
    testEvent.startTime = tomorrow;
    await testEvent.save();
    let expected = testEvent._id;

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["fun"];
    testEvent.startTime = tomorrow;
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["toys"];
    testEvent.startTime = tomorrow;
    await testEvent.save();

    request(app)
      .get(`/events/api/avail/${userId}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toHaveLength(4);
        done();
      });
  });

  test("throw error when getting available events for unexisting user", (done) => {
    request(app)
      .get(`/events/api/avail/missing`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end(() => {
        done();
      });
  });

  test("get events user is in and return successfully", async (done) => {
    // User is not in this event
    let testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["fun"];
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    testEvent.startTime = tomorrow;
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["sports"];
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    testEvent.startTime = yesterday;
    testEvent.attendantsList.push(userId);
    await testEvent.save();

    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["sports"];
    testEvent.startTime = yesterday;
    testEvent.attendantsList.push(userId);
    await testEvent.save();

    // Should only have one, because this is tomorrow, and user is in
    testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["toys"];
    testEvent.startTime = tomorrow;
    testEvent.attendantsList.push(userId);
    await testEvent.save();

    request(app)
      .get(`/events/api/in/${userId}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toHaveLength(1);
        done();
      });
  });

  test("throw error when getting events user is in for unexisting user", (done) => {
    request(app)
      .get(`/events/api/in/missing`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("suggest event and return successfully", async (done) => {
    // User is not in this event
    let testEvent = new EventModel(TestData.completeEvent);
    testEvent.tagList = ["fun"];
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    testEvent.startTime = tomorrow;
    await testEvent.save();
    request(app)
      .get(`/events/api/suggest/${userId}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data).toMatchObject(
          createExpectedReturn(testEvent.toJSON())
        );
        done();
      });
  });

  test("throw error when suggesting event for unexisting user", (done) => {
    request(app)
      .get(`/events/api/suggest/missing`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("throw error when no there are no events to suggest", (done) => {
    request(app)
      .get(`/events/api/suggest/${userId}`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("create event endpoint", (done) => {
    request(app)
      .get(`/events/create/${userId}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        done();
      });
  });

  test("create event endpoint, user doesn't exist", (done) => {
    request(app)
      .get(`/events/create/missing`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });

  test("notify test", (done) => {
    request(app)
      .get(`/events/notify/topic`)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        done();
      });
  });

  test("notify test, failure", (done) => {
    request(app)
      .get(`/events/notify/fail`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        done();
      });
  });
});
