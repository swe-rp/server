const event = require("../common/event.js");
const mongoose = require("mongoose");

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
      let userId = mongoose.Types.ObjectId();
      let testEvent = {
        name: "event",
        description: "event description",
        host: userId,
        attendantsList: [userId],
        startTime: "1",
        endTime: "2",
        tags: ["fun", "social"]
      };

      let expectedEvent = {
        name: "event",
        description: "event description",
        host: userId,
        attendantsList: [userId],
        startTime: new Date("1"),
        endTime: new Date("2"),
        tagList: ["fun", "social"]
      };

      let retVal = await event.createEvent(testEvent);

      expect(retVal.data.toObject()).toMatchObject(expectedEvent);
    });
  });

  describe("updateEvent", () => {
    test("Update an event", () => {});
  });

  describe("getAvailableEvents", () => {
    test("Get available events", () => {});
  });

  describe("getUserEvents", () => {});

  describe("addAttendant", () => {});

  describe("removeAttendant", () => {});

  describe("suggestEvent", () => {});

  afterAll(async () => {
    await db.close();
  });
});
