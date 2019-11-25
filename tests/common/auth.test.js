const auth = require("../../common/auth.js");
const mongoose = require("mongoose");
const UserModel = require("../../models/user.js");
const testData = require("../test_data.js");

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

describe("auth", () => {
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

  describe("middleware", () => {
    test("authorized user", async () => {
      let user = new UserModel(testData.user);
      await user.save();

      await auth.middleware(
        {
          header: (e) => {
            switch (e) {
              case "userId":
                return user.id;
              case "accessToken":
                return user.accessToken;
            }
          }
        },
        undefined,
        (e) => {
          expect(e).toBe(undefined);
        }
      );
    });

    test("missing tokens, unauthorized user", async () => {
      let user = new UserModel(testData.user);
      await user.save();

      await auth.middleware(
        {
          header: (e) => {
            switch (e) {
              case "accessToken":
                return user.accessToken;
            }
          }
        },
        undefined,
        (e) => {
          expect(e).not.toBe(undefined);
        }
      );
    });

    test("has tokens, mismatch", async () => {
      let user = new UserModel(testData.user);
      await user.save();

      await auth.middleware(
        {
          header: (e) => {
            switch (e) {
              case "userId":
                return user.id;
              case "accessToken":
                return "bogus";
            }
          }
        },
        undefined,
        (e) => {
          expect(e).not.toBe(undefined);
        }
      );
    });

    test("user doesn't exist", async () => {
      await auth.middleware(
        {
          header: (e) => {
            switch (e) {
              case "userId":
                return mongoose.Types.ObjectId();
              case "accessToken":
                return "bogus";
            }
          }
        },
        undefined,
        (e) => {
          expect(e).not.toBe(undefined);
        }
      );
    });
  });

  afterAll(async () => {
    await db.close();
  });
});
