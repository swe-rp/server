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
const passport = require("passport");
const admin = require("firebase-admin");

jest.mock("passport", () => {
  return {
    authenticate: () => (req, res, next) => {
      req.user = req.body.user;
      return next();
    },
    use: jest.fn()
  };
});

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

describe("routes/users.js tests", () => {
  let userId;

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
  });

  test("Authenticate existing user", (done) => {
    request(app)
      .post("/users/oauth")
      .send({
        access_token: "something",
        user: {
          id: "1",
          displayName: "Sam",
          emails: ["sam@sam.com"]
        }
      })
      .set("registration_token", "token")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body.userId)).toBe(JSON.stringify(userId));
        done();
      });
  });

  test("Authenticate new user", (done) => {
    request(app)
      .post("/users/oauth")
      .send({
        access_token: "something",
        user: {
          id: "2",
          displayName: "NotSam",
          emails: ["notsam@notsam.com"]
        }
      })
      .set("registration_token", "token")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.userId).not.toBe(userId);
        done();
      });
  });

  test("Authenticate new user, wrong params", (done) => {
    request(app)
      .post("/users/oauth")
      .send({
        access_token: "something"
      })
      .set("registration_token", "token")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .end((err, res) => {
        expect(res.status).toBe(500);
        done();
      });
  });
});
