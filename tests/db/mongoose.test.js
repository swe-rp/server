const db = require("../../db/mongoose.js");
const mongoose = require("mongoose");
const connect = mongoose.connect;

jest.mock("mongoose", () => {
  return {
    connect: jest.fn()
  };
});

// Supress the logging
jest.mock("../../common/utils.js", () => {
  return {
    log: (e) => {},
    error: (e) => {}
  };
});

describe("DB testing", () => {
  let MONGO_URL;
  describe("Connection", () => {
    test("Connection fails", async () => {
      try {
        connect.mockImplementation(() => Promise.resolve("Success"));
        MONGO_URL = process.env.MONGO_URL;
        delete process.env.MONGO_URL;
        await db.init();
        // Shouldn't reach this
        process.env.MONGO_URL = MONGO_URL;
        expect(false).toBe(true);
      } catch (e) {
        process.env.MONGO_URL = MONGO_URL;
        expect(true).toBe(true);
      }
    });

    test("Connection works", async () => {
      connect.mockImplementation(() => Promise.resolve("Success"));
      await db.init();
      expect(true).toBe(true);
    });

    test("Connection fails", async () => {
      connect.mockImplementation(() => Promise.reject("Fail"));
      await db.init();
      expect(true).toBe(true);
    });
  });
});
