const event = require("../common/event.js");
const mongoose = require("mongoose");
const TestData = require("./test_data");
const EventModel = require("../models/event");

test("mock", () => {
  expect(3).toBe(3);
});

test("another mock", () => {
  expect(3).toBe(3);
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
      console.log(e);
      process.exit();
    }
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

    test("Try to create new event missing field", async () => {
      let testEvent = Object.assign({}, TestData.incompleteEvent);

      expect(event.createEvent(testEvent)).rejects.toEqual("Wrong params");
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

      let retVal = await event.updateEvent(testEvent._id, testEvent);

      expect(retVal.data.toJSON()).toMatchObject(expectedEvent);
    });

    test("Update incomplete event", async () => {
      let testEvent = Object.assign({}, TestData.incompleteEvent);

      expect(event.updateEvent(testEvent._id, testEvent)).rejects.toEqual("Wrong params");
    });

    test("Update unexistent event", async () => {
      let retVal = a
    });
  });

  describe("getAvailableEvents", () => {
    test("Get available events", () => {});

    test("Get available events for unexisting user", () => {});
  });

  describe("getUserEvents", () => {});

  describe("addAttendant", () => {});

  describe("removeAttendant", () => {});

  describe("suggestEvent", () => {});

  afterAll(async () => {
    await db.close();
  });
});
