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
          return Promise.resolve(e.topic);
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
      .end(() => {
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
      .end(() => {
        done();
      });
  });

  test("add user to existing event and return successfully", (done) => {
    request(app)
      .put(`/events/api/add/${eventId}/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(() => {
        done();
      });
  });

  test("throw error when adding user to unexisting event", (done) => {
    request(app)
      .put(`/events/api/add/missing/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end(() => {
        done();
      });
  });

  test("throw error when adding unexisting user", (done) => {
    request(app)
      .put(`/events/api/add/${eventId}/missing`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end(() => {
        done();
      });
  });

  test("remove user from existing event and return successfully", (done) => {
    request(app)
      .put(`/events/api/remove/${eventId}/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(() => {
        done();
      });
  });

  test("throw error when removing user from unexisting event", (done) => {
    request(app)
      .put(`/events/api/remove/missing/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500)
      .end(() => {
        done();
      });
  });

  test("update event and returns successfully", (done) => {
    let updated = Object.assign({}, TestData.completeEvent);
    updated.description = "new description";
    request(app)
      .put(`/events/api/${eventId}`)
      .send(updated)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(() => {
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
      .end(() => {
        done();
      });
  });

  test("get available events and return successfully", (done) => {
    done();
  });

  //   test("throw error when getting available events for unexisting user", function(done) {});

  //   test("get events user is in and return successfully", function(done) {});

  //   test("throw error when getting events user is in for unexisting user", function(done) {});

  //   test("suggest event and return successfully", function(done) {});

  //   test("throw error when suggesting event for unexisting user", function(done) {});

  //   test("throw error when no there are no events to suggest", function(done) {});

  // test('get recommendations and returns successfully', function (done) {
  //     request(app)
  //         .get('/recommendations/testUser')
  //         .set('Accept', 'application/json')
  //         .expect('Content-Type', /json/)
  //         .expect(200, done);
  // });

  // test('throws an error when attempting to get recommendations for non-existent user', function (done) {
  //     request(app)
  //         .get('/recommendations/idisnonexisting')
  //         .set('Accept', 'application/json')
  //         .expect('Content-Type', /json/)
  //         .expect(500)
  //         .end((err) => {
  //             if (err) return done(err);
  //             done();
  //         });
  // });
});
