const event = require("../common/event.js");
const mongoose = require("mongoose");

test("mock", () => {
  expect(3).toBe(3);
});

test("another mock", () => {
  expect(3).toBe(3);
});

describe("events", () => {
  beforeAll(async () => {
    await mongoose
      .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then((res) => console.log("Connection to CosmosDB successful."))
      .catch((err) => console.log("Connection to CosmosDB failed.", err));
  });

  describe("createEvent", () => {
    test("Create a new event", () => {
      let a = event.createEvent({
        name: "event",
        description: "event description",
        host: "123456",
        attendantsList: ["123456"],
        startTime: "12323232",
        endTime: "12323232",
        tagList: ["fun", "social"]
      });
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
});
