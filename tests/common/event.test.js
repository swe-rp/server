const event = require("../../common/event.js");
const mongoose = require("mongoose");
const TestData = require("../test_data");
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

const utils = require("../../common/utils.js");
// Supress the logging
jest.mock("../../common/utils.js", () => {
  return {
    log: (e) => {},
    error: (e) => {},
    debug: (e) => {}
  };
});

describe("events", () => {
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

  describe("createEvent", () => {
    test("Create a new event", async () => {
      let testEvent = Object.assign({}, TestData.completeEvent);

      let expectedEvent = Object.assign({}, TestData.completeEvent);
      expectedEvent.startTime = new Date(expectedEvent.startTime);
      expectedEvent.endTime = new Date(expectedEvent.endTime);

      let retVal = await event.createEvent(testEvent);

      expect(retVal.data.toJSON()).toMatchObject(expectedEvent);
    });

    test("Create a new event, with JSON", async () => {
      let testEvent = Object.assign({}, TestData.completeEvent);
      testEvent.tagList = JSON.stringify(testEvent.tagList);

      let expectedEvent = Object.assign({}, TestData.completeEvent);
      expectedEvent.startTime = new Date(expectedEvent.startTime);
      expectedEvent.endTime = new Date(expectedEvent.endTime);

      let retVal = await event.createEvent(testEvent);

      expect(retVal.data.toJSON()).toMatchObject(expectedEvent);
    });

    test("Create a new event, with an existing user", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();
      let testEvent = Object.assign({}, TestData.completeEvent);
      testEvent.host = testUser.id;
      delete testEvent.attendantsList;

      let expectedEvent = Object.assign({}, TestData.completeEvent);
      delete expectedEvent.host;
      delete expectedEvent.attendantsList;
      expectedEvent.startTime = new Date(expectedEvent.startTime);
      expectedEvent.endTime = new Date(expectedEvent.endTime);

      let retVal = await event.createEvent(testEvent);

      expect(retVal.data.toJSON()).toMatchObject(expectedEvent);
    });

    test("Try to create new event missing field", async () => {
      let testEvent = Object.assign({}, TestData.incompleteEvent);

      await expect(event.createEvent(testEvent)).rejects.toEqual(
        new Error("Wrong params")
      );
    });
  });

  describe("updateEvent", () => {
    test("Update an event", async () => {
      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();
      testEvent.description = "new desc";

      let expectedEvent = Object.assign({}, TestData.completeEvent);
      expectedEvent.startTime = new Date(expectedEvent.startTime);
      expectedEvent.endTime = new Date(expectedEvent.endTime);
      expectedEvent.description = "new desc";

      let retVal = await event.updateEvent(
        testEvent._id,
        testEvent,
        testEvent.host
      );

      expect(retVal.data.toJSON()).toMatchObject(expectedEvent);
    });

    test("Update an event, with JSON", async () => {
      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();
      testEvent.description = "new desc";
      testEvent.tagList = JSON.stringify(testEvent.tagList);

      let expectedEvent = Object.assign({}, TestData.completeEvent);
      expectedEvent.startTime = new Date(expectedEvent.startTime);
      expectedEvent.endTime = new Date(expectedEvent.endTime);
      expectedEvent.description = "new desc";

      let retVal = await event.updateEvent(
        testEvent._id,
        testEvent,
        testEvent.host
      );

      expect(retVal.data.toJSON()).toMatchObject(expectedEvent);
    });

    test("Update unexistent event", async () => {
      let testEvent = Object.assign({}, TestData.completeEvent);

      await expect(
        event.updateEvent(mongoose.Types.ObjectId(), testEvent)
      ).rejects.toEqual(new Error("Event does not exist"));
    });
  });

  describe("getAvailableEvents", () => {
    test("Get available events", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      let testEvent = new EventModel(TestData.completeEvent);
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      testEvent.startTime = tomorrow;
      await testEvent.save();

      let retVal = await event.getAvailableEvents(testUser._id, "1,1");

      expect(retVal.data).toHaveLength(1);
      // expect(retVal.data[0].toJSON()).toMatchObject(TestData.completeEvent);
    });

    test("Get available events for unexisting user", async () => {
      await expect(
        event.getAvailableEvents(mongoose.Types.ObjectId(), "1,1")
      ).rejects.toEqual(new Error("User doesnt exist"));
    });
  });

  describe("getUserEvents", () => {
    test("Get user events", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      let testEvent = new EventModel(TestData.completeEvent);
      testEvent.attendantsList.push(testUser._id);
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      testEvent.startTime = tomorrow;
      await testEvent.save();

      let retVal = await event.getUserEvents(testUser._id);

      expect(retVal.data).toHaveLength(1);
      // expect(retVal.data[0].toJSON()).toMatchObject(TestData.completeEvent);
    });

    test("Get user events for unexisting user", async () => {
      await expect(
        event.getUserEvents(mongoose.Types.ObjectId())
      ).rejects.toEqual(new Error("User doesnt exist"));
    });
  });

  describe("addAttendant", () => {
    test("Add attendant", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();

      let retVal = await event.addAttendant(testEvent._id, testUser._id);

      expect(retVal.data.toJSON().attendantsList).toContainEqual(testUser._id);
    });

    test("Add attendant for unexisting event", async () => {
      await expect(
        event.addAttendant(mongoose.Types.ObjectId(), mongoose.Types.ObjectId())
      ).rejects.toEqual(new Error("Event doesnt exist"));
    });

    test("Add attendant for unexisting user", async () => {
      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();

      await expect(
        event.addAttendant(testEvent._id, mongoose.Types.ObjectId())
      ).rejects.toEqual(new Error("User doesnt exist"));
    });
  });

  describe("removeAttendant", () => {
    test("Remove attendant", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      let testEvent = new EventModel(TestData.completeEvent);
      testEvent.attendantsList.push(testUser._id);
      await testEvent.save();

      let retVal = await event.removeAttendant(testEvent._id, testUser._id);

      expect(retVal.data.toJSON().attendantsList).not.toContainEqual(
        testUser._id
      );
    });

    test("Remove attendant for unexisting event", async () => {
      await expect(
        event.removeAttendant(
          mongoose.Types.ObjectId(),
          mongoose.Types.ObjectId()
        )
      ).rejects.toEqual(new Error("Event doesnt exist"));
    });

    test("Remove attendant for unexisting user", async () => {
      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();

      await expect(
        event.removeAttendant(testEvent._id, mongoose.Types.ObjectId())
      ).rejects.toEqual(new Error("User doesnt exist"));
    });
  });

  describe("suggestEvent", () => {
    test("Get suggested events, no events", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      await expect(event.suggestEvent(testUser._id, "1,1")).rejects.toEqual(
        new Error("No events")
      );
    });

    test("Get suggested event", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();

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
      testEvent.attendantsList.push(testUser._id);
      await testEvent.save();

      testEvent = new EventModel(TestData.completeEvent);
      testEvent.tagList = ["sports"];
      testEvent.startTime = yesterday;
      testEvent.attendantsList.push(testUser._id);
      await testEvent.save();

      testEvent = new EventModel(TestData.completeEvent);
      testEvent.tagList = ["toys"];
      testEvent.startTime = yesterday;
      testEvent.attendantsList.push(testUser._id);
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

      let retVal = await event.suggestEvent(
        testUser._id,
        TestData.completeEvent.location
      );

      expect(retVal.data._id).toEqual(expected);
    });

    test("Get suggested events for unexisting user", async () => {
      await expect(
        event.suggestEvent(mongoose.Types.ObjectId(), "1,1")
      ).rejects.toEqual(new Error("User doesnt exist"));
    });
  });

  describe("deleteEvent", () => {
    test("Delete an existing event", async () => {
      let testUser = new UserModel(TestData.user);
      await testUser.save();
      let testEvent = new EventModel(TestData.completeEvent);
      testEvent.host = testUser.id;
      await testEvent.save();
      try {
        await event.deleteEvent(testEvent.id, testEvent.host);
      } catch (e) {
        console.log(e);
        expect(true).toBe(false);
      }
    });

    test("Delete a non-existent event", async () => {
      await expect(
        event.deleteEvent(mongoose.Types.ObjectId(), mongoose.Types.ObjectId())
      ).rejects.toEqual(new Error("Event doesnt exist"));
    });

    test("Delete an event, non-existent user", async () => {
      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();

      await expect(
        event.deleteEvent(testEvent.id, mongoose.Types.ObjectId())
      ).rejects.toEqual(new Error("User doesnt exist"));
    });

    test("Delete an event, not the host", async () => {
      let testEvent = new EventModel(TestData.completeEvent);
      await testEvent.save();
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      await expect(
        event.deleteEvent(testEvent.id, testUser.id)
      ).rejects.toEqual(new Error("You're not the host!"));
    });
  });

  afterAll(async () => {
    await db.close();
  });
});
