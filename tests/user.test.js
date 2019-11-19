const user = require("../common/user.js");
const UserModel = require("../models/user.js");
const testData = require("./test_data.js");
const mongoose = require("mongoose");

describe("user", () => {
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

  describe("doesUserExist", () => {
    test("User exists", async () => {
      let mockUser = new UserModel(testData.userArray[0]);
      let userData = await mockUser.save();
      let userExistence = await user.doesUserExist(userData.toJSON()._id);
      expect(userExistence).toBe(true);
    });

    test("User does not exist", async () => {
      let userId = mongoose.Types.ObjectId();
      let userExistence = await user.doesUserExist(userId);
      expect(userExistence).toBe(false);
    });

    test("User does not exist, malformed", async () => {
      let userExistence = await user.doesUserExist("aaa");
      expect(userExistence).toBe(false);
    });
  });

  afterAll(async () => {
    await db.close();
  });
});
