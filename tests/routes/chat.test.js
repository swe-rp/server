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
const chat = require("../../common/chat.js");

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
    error: (e) => {}
  };
});

describe("chat", () => {
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

  test("chat init, existing user", (done) => {
    request(app)
      .get(`/chat/init/${eventId}`)
      .set("userId", userId)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  test("chat init, non-existent user", (done) => {
    request(app)
      .get(`/chat/init/${eventId}`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  test("get existing messages, existing event", async () => {
    await chat.handleMessage(eventId, userId, "test", new Date());
    let req = await request(app)
      .get(`/chat/messages/${eventId}`)
      .set("userId", userId);
    expect(req.status).toBe(200);
    let response = JSON.parse(req.text);
    expect(response.data.length).toBe(1);
    expect(response.data[0].message).toBe("test");
  });

  test("get existing messages, non-existent event", (done) => {
    request(app)
      .get(`/chat/messages/${mongoose.Types.ObjectId()}`)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });
});
