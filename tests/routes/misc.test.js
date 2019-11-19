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
  const utils = require("../../common/utils.js");
  
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
  jest.mock("../../common/utils.js", () => {
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
  
  describe("misc tests", () => {
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
  
    test("Check heartbeat", (done) => {
      request(app)
        .get("/")
        .send(TestData.completeEvent)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .end((err, res) => {
          expect(res.status).toBe(200);
          done();
        });
    });
  });
  