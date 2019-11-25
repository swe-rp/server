// Tests the event controller

// Functions tested
//     - POST /api
//     - PUT /api/add/:id/:userId
//     - PUT /api/remove/:id/:userId
//     - PUT /api/:
//     - GET /api/avail/:userId
//     - GET /api/in/:userId
//     - GET /api/suggest/:userId

process.env = Object.assign(process.env, {
  FB_CLIENT_ID: "test",
  FB_CLIENT_SECRET: "test"
});

const TestData = require("../test_data");
const request = require("supertest");
const app = require("../../app/app.js");
const db = require("../../db/mongoose.js");
const mongoose = require("mongoose");
const EventModel = require("../../models/event");
const UserModel = require("../../models/user");

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
      },
      unsubscribeFromTopic: (token, topic) => {
        if (topic) {
          return Promise.resolve(topic);
        } else {
          return Promise.reject("no topic");
        }
      }
    })
  };
});

const auth = require("../../common/auth.js");

jest.mock("../../common/auth.js", () => {
  return {
    middleware: (req, res, next) => {
      next();
    }
  };
});

// Supress the logging
jest.mock("../../common/utils.js", () => {
  return {
    log: (e) => {},
    error: (e) => {},
    debug: (e) => {}
  };
});

// Sanitize our events to a string
let createExpectedReturn = (event) => {
  let expectedEvent = Object.assign({}, event);
  expectedEvent.startTime = new Date(event.startTime).toISOString();
  expectedEvent.endTime = new Date(event.endTime).toISOString();
  delete expectedEvent.host;
  expectedEvent.attendantsList = event.attendantsList.map((e) => e.toString());
  delete expectedEvent._id;
  return expectedEvent;
};

describe("routes/events.js tests", () => {
  let userId;
  let eventUserId;
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

    let testEventUser = new UserModel(TestData.user2);
    testEventUser = await testEventUser.save();
    eventUserId = testEventUser._id;

    let testEvent = new EventModel(TestData.completeEvent);
    testEvent.host = eventUserId;
    testEvent = await testEvent.save();
    eventId = testEvent._id;
  });

  test("create event and returns successfully", (done) => {
    request(app)
      .post("/events/api")
      .send(TestData.completeEvent)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
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
      .end((err, res) => {
        expect(res.status).toBe(500);
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
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject(expectedReturn);
        done();
      });
  });

  test("throw error when adding user to unexisting event", (done) => {
    request(app)
      .put(`/events/api/add/missing/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("throw error when adding unexisting user", (done) => {
    request(app)
      .put(`/events/api/add/${eventId}/missing`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("remove user from existing event and return successfully", (done) => {
    request(app)
      .put(`/events/api/remove/${eventId}/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
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
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("update event and returns successfully", (done) => {
    let updated = Object.assign({}, TestData.completeEvent);
    updated.description = "new description";
    let expectedReturn = createExpectedReturn(updated);
    request(app)
      .put(`/events/api/edit/${eventId}`)
      .send(updated)
      .set("Accept", "application/json")
      .set("userId", eventUserId)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject(expectedReturn);
        done();
      });
  });

  test("throw error when updating event with missing information", (done) => {
    let updated = Object.assign({}, TestData.completeEvent);
    updated.description = null;
    request(app)
      .put(`/events/api/edit/${eventId}`)
      .send(updated)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("delete an event", (done) => {
    request(app)
      .delete(`/events/api/delete/${eventId}`)
      .set("userId", eventUserId)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  test("throw an error when deleting an event because not host", (done) => {
    request(app)
      .delete(`/events/api/delete/${eventId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
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
      .set("userLocation", "1,1")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(4);
        done();
      });
  });

  test("throw error when getting available events for unexisting user", (done) => {
    request(app)
      .get(`/events/api/avail/missing`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
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

      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        done();
      });
  });

  test("throw error when getting events user is in for unexisting user", (done) => {
    request(app)
      .get(`/events/api/in/missing`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
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
    let retVal = testEvent.toJSON();
    retVal.hostname = "Anonymous";
    request(app)
      .get(`/events/api/suggest/${userId}`)
      .expect("Content-Type", /json/)
      .send({ userLocation: "1,1" })
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject(createExpectedReturn(retVal));
        done();
      });
  });

  test("throw error when suggesting event for unexisting user", (done) => {
    request(app)
      .get(`/events/api/suggest/missing`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("throw error when no there are no events to suggest", (done) => {
    request(app)
      .get(`/events/api/suggest/${userId}`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("create event endpoint", (done) => {
    request(app)
      .get(`/events/create`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  test("edit event endpoint, existing event", (done) => {
    request(app)
      .get(`/events/edit/${eventId}`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  test("edit event endpoint, non-existent event", (done) => {
    request(app)
      .get(`/events/edit/${mongoose.Types.ObjectId()}`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });
});
