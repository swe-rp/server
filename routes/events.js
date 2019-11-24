const express = require("express");
const path = require("path");
const router = new express.Router();
const Event = require("../common/event");
const User = require("../common/user");
const utils = require("../common/utils");
const notifications = require("../common/notification");
const auth = require("../common/auth.js");

// Event api
// Create event
router.post("/api", auth.middleware, async (req, res, next) => {
  try {
    const newEvent = await Event.createEvent(req.body);
    newEvent.message = "Success!";
    res.status(200).json(newEvent);
    utils.log(
      await notifications.sendNotification("event", {
        title: "New event created",
        body: "Check it out!"
      })
    );
    utils.log("Event creation success.");
  } catch (err) {
    utils.log("Event creation failed.");
    next({ success: false, message: err.message });
  }
});

// Add attendant
router.put("/api/add/:id/:userId", auth.middleware, async (req, res, next) => {
  try {
    const updatedEvent = await Event.addAttendant(
      req.params.id,
      req.params.userId
    );
    utils.log("Sucessfully added", req.params.userId, "from", req.params.id);
    updatedEvent.message = "Success!";
    res.status(200).json(updatedEvent);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

// Remove an attendant
router.put(
  "/api/remove/:id/:userId",
  auth.middleware,
  async (req, res, next) => {
    try {
      const updatedEvent = await Event.removeAttendant(
        req.params.id,
        req.params.userId
      );
      utils.log(
        "Sucessfully removed",
        req.params.userId,
        "from",
        req.params.id
      );
      updatedEvent.message = "Success!";
      res.status(200).json(updatedEvent);
    } catch (err) {
      next({ success: false, message: err.message });
    }
  }
);

// Edit event
router.put("/api/edit/:id", auth.middleware, async (req, res, next) => {
  try {
    const updatedEvent = await Event.updateEvent(
      req.params.id,
      req.body,
      req.header("userId")
    );
    updatedEvent.message = "Success!";
    res.status(200).json(updatedEvent);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

// Delete event
router.delete("/api/delete/:id", auth.middleware, async (req, res, next) => {
  try {
    await Event.deleteEvent(req.params.id, req.header("userId"));
    res.status(200).send({ message: "Success!" });
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

router.get("/api/avail/:userId", auth.middleware, async (req, res, next) => {
  try {
    const events = await Event.getAvailableEvents(req.params.userId, req.body.userLocation);
    events.message = "Sucess!";
    res.status(200).json(events);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

// Get events
router.get("/api/in/:userId", auth.middleware, async (req, res, next) => {
  try {
    const events = await Event.getUserEvents(req.params.userId);
    events.message = "Success!";
    res.status(200).json(events);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

// Suggest event
router.get("/api/suggest/:userId", auth.middleware, async (req, res, next) => {
  try {
    const event = await Event.suggestEvent(req.params.userId, req.body.userLocation);
    event.message = "Success!";
    res.status(200).json(event);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

/**
 * Temporarily allow us to create events through a webpage.
 */
router.get("/create", auth.middleware, async (req, res, next) => {
  res.render("index", {
    title: "Create",
    requestType: "POST",
    requestUrl: "https://api.evnt.me/events/api",
    accessToken: req.header("accessToken"),
    userId: req.header("userId"),
    locationText: "Set value.."
  });
});

router.get("/edit/:eventId", auth.middleware, async (req, res, next) => {
  let event = {};
  try {
    event = await Event.getEvent(req.params.eventId);
  } catch (err) {
    next({ success: false, message: "Event not found." });
  }
  res.render("index", {
    title: "Edit",
    requestType: "PUT",
    requestUrl: "https://api.evnt.me/events/api/edit/" + req.params.eventId,
    accessToken: req.header("accessToken"),
    userId: req.header("userId"),
    name: event.name,
    description: event.description,
    locationText: "Edit value..",
    startTime: event.startTime,
    endTime: event.endTime,
    tags: event.tagList.reduce((prev, curr) => {
      prev + "," + curr;
    }, "")
  });
});

// TODO this should be removed
router.get("/notify/:topic", async (req, res, next) => {
  try {
    utils.log(
      await notifications.sendNotification(req.params.topic, {
        title: `Test for topic ${req.params.topic}`,
        body: "..from the GET endpoint."
      })
    );
    res.status(200).send("Success.");
  } catch (e) {
    next("Failure.");
  }
});

module.exports = router;
