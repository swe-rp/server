const notification = require("../../common/notification.js");
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

describe("notification", () => {
  describe("sendNotification", () => {
    test("send a notification to topic: topic", async () => {
      let retVal = await notification.sendNotification("topic", {
        title: "title",
        body: "body"
      });
      expect(retVal).toEqual(expect.stringContaining("Created message: topic"));
    });

    test("send a notification to topic: test", async () => {
      let retVal = await notification.sendNotification("test", {
        title: "title",
        body: "body"
      });
      expect(retVal).toEqual(expect.stringContaining("Created message: test"));
    });

    test("send a notification without a proper topic", async () => {
      try {
        await notification.sendNotification("", {
          title: "title",
          body: "body"
        });
      } catch (e) {
        expect(e).toEqual(expect.stringContaining("Error: no topic"));
      }
    });
  });

  describe("subscribeToTopic", () => {
    test("subscribe to a topic: topic", async () => {
      let retVal = await notification.subscribeToTopic("topic", "token");
      expect(retVal).toEqual(
        expect.stringContaining("Created/subscribed to topic: topic")
      );
    });

    test("subscribe to topic without a proper topic", async () => {
      try {
        await notification.subscribeToTopic("", "");
      } catch (e) {
        expect(e).toEqual(expect.stringContaining("Error: no topic"));
      }
    });
  });

  describe("unsubscribeToTopic", () => {
    test("unsubscribe from a topic: topic", async () => {
      let retVal = await notification.unsubscribeFromTopic("topic", "token");
      expect(retVal).toEqual(
        expect.stringContaining("Unsubscribed from topic: topic")
      );
    });

    test("unsubscribe to topic without a proper topic", async () => {
      try {
        await notification.unsubscribeFromTopic("", "");
      } catch (e) {
        expect(e).toEqual(expect.stringContaining("Error: no topic"));
      }
    });
  });
});
