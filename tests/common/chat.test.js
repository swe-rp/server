const chat = require("../../common/chat.js");
const mongoose = require("mongoose");
const testData = require("../test_data.js");
const UserModel = require("../../models/user.js");
const EventModel = require("../../models/event.js");

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

const utils = require("../../common/utils.js");
// Supress the logging
jest.mock("../../common/utils.js", () => {
  return {
    log: (e) => {},
    error: (e) => {},
    debug: (e) => {}
  };
});

describe("chat", () => {
  let db;

  beforeAll(async () => {
    try {
      db = await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      });
    } catch (e) {
      process.exit();
    }
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe("Handle message", () => {
    test("Handle message with existing user and event", async () => {
      let testEvent = new EventModel(testData.completeEvent);
      await testEvent.save();
      let testUser = new UserModel(testData.user);
      await testUser.save();

      let timestamp = new Date();
      let message = "message";

      await chat.handleMessage(testEvent.id, testUser.id, message, timestamp);

      let event = await EventModel.findById(testEvent.id);
      expect(event.toJSON().chatMessages.length).toBe(1);
      expect(event.toJSON().chatMessages[0]).toMatchObject({
        username: testUser.name,
        message: message,
        timestamp: timestamp
      });
    });

    test("Handle message for unexisting user", async () => {
      let testEvent = new EventModel(testData.completeEvent);
      await testEvent.save();

      let timestamp = new Date();
      let message = "message";

      await expect(
        chat.handleMessage(
          testEvent.id,
          mongoose.Types.ObjectId(),
          message,
          timestamp
        )
      ).rejects.toEqual(new Error("User doesn't exist."));

      let event = await EventModel.findById(testEvent.id);
      expect(event.toJSON().chatMessages.length).toBe(0);
    });

    test("Handle message for unexisting event", async () => {
      let testUser = new UserModel(testData.user);
      await testUser.save();

      let timestamp = new Date();
      let message = "message";

      await expect(
        chat.handleMessage(
          mongoose.Types.ObjectId(),
          testUser.id,
          message,
          timestamp
        )
      ).rejects.toEqual(new Error("Event not found."));
    });
  });

  describe("Get chat history", () => {
    test("Get chat history success", async () => {
      let testEvent = new EventModel(testData.completeEvent);
      await testEvent.save();
      let testUser = new UserModel(testData.user);
      await testUser.save();

      let timestamp = new Date();
      let message = "message";

      await chat.handleMessage(testEvent.id, testUser.id, message, timestamp);

      let history = await chat.getChatHistory(testEvent.id);

      expect(history.id).toBe(testEvent.id);
      expect(history.data.length).toBe(1);
      expect(history.data[0]).toMatchObject({
        username: testUser.name,
        message: message,
        timestamp: timestamp
      });
    });

    test("Get chat history for unexisting event", async () => {
      await expect(chat.getChatHistory(mongoose.Types.ObjectId())).rejects.toEqual(
        new Error("Event not found.")
      );
    });
  });

  afterAll(async () => {
    await db.close();
  });
});
