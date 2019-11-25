const utils = require("../../common/utils.js");

global.console = {
  log: jest.fn()
};

describe("utils", () => {
  describe("log", () => {
    test("log a value", () => {
      utils.log("test");
      expect(global.console.log).toHaveBeenCalledWith(
        expect.any(String),
        "test"
      );
    });
  });
  describe("error", () => {
    test("error a value", () => {
      utils.error("test");
      expect(global.console.log).toHaveBeenCalledWith(
        expect.any(String),
        "test"
      );
    });
  });
  describe("debug", () => {
    test("debug a value", () => {
      utils.debug("test");
      expect(global.console.log).toHaveBeenCalledWith(
        expect.any(String),
        "test"
      );
    });
  });
});
