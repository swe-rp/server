const user = require("../../common/user.js");
const UserModel = require("../../models/user.js");
const testData = require("../test_data.js");
const mongoose = require("mongoose");
const utils = require("../../common/utils.js");

// Supress the logging
jest.mock("../../common/utils.js", () => {
  return {
    log: (e) => {},
    error: (e) => {},
    debug: (e) => {}
  };
});

const admin = require("firebase-admin");

jest.mock("firebase-admin", () => {
  return {
    messaging: jest.fn().mockReturnValue({
      send: (e) => {
        if (e.topic) {
          return Promise.resolve(e.topic);
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

describe("user", () => {
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

  describe("doesUserExist", () => {
    test("User exists", async () => {
      let mockUser = new UserModel(testData.user);
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

  describe("userLogin", () => {
    test("User login, new", async () => {
      let userProfile = await user.userLogin(
        {
          id: "1",
          displayName: "Sam",
          emails: ["sam@sam.com"]
        },
        "token"
      );

      expect(userProfile.toJSON()).toMatchObject({
        facebookId: "1",
        name: "Sam",
        registrationToken: "token"
      });
    });

    test("User login, existing", async () => {
      await user.userLogin(
        {
          id: "1",
          displayName: "Sam",
          emails: ["sam@sam.com"]
        },
        "token"
      );
      let userProfile = await user.userLogin(
        {
          id: "1",
          displayName: "Sam",
          emails: ["sam@sam.com"]
        },
        "token"
      );

      expect(userProfile.toJSON()).toMatchObject({
        facebookId: "1",
        name: "Sam",
        registrationToken: "token"
      });
    });

    test("User login, bad params", async () => {
      await expect(user.userLogin()).rejects.toEqual(
        new Error("Parameters are malformed!")
      );
    });
  });

  afterAll(async () => {
    await db.close();
  });
});
