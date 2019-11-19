const event = require("../common/event.js");
const mongoose = require("mongoose");
const TestData = require("./test_data");
const EventModel = require("../models/event");
const UserModel = require("../models/user");
const {performance} = require('perf_hooks');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
jest.setTimeout(6000);

describe("non function requirements", () => {
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

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe("suggestEvent", () => {
    test("Suggest event runs in less than 6 second", async () => {
      let start = performance.now();
    
      let testUser = new UserModel(TestData.user);
      await testUser.save();

      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let tags = ["fun", "sports", "toys"];

      for (let i = 0; i < 1000; i++){
        let testEvent = new EventModel(TestData.completeEvent);
        testEvent.tagList = [tags[getRandomInt(0,2)]];
        testEvent.startTime = Math.random() >= 0.5 ? tomorrow : yesterday;
        await testEvent.save();
      }

      let retVal = await event.suggestEvent(testUser._id);

      let end = performance.now();

      expect(end - start).toBeLessThan(6000);
    });
  });

  afterAll(async () => {
    await db.close();
  });
});
