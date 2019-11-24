const chat = require("../common/chat.js");
const express = require("express");
const router = new express.Router();
const utils = require("../common/utils");

router.get("/send/:eventId/:userId/:message", async (req, res, next) => {
  try {
    utils.log(
      `Sending message ${req.params.message} to ${req.params.eventId} from ${req.params.userId}`
    );
    await chat.handleMessage(
      req.params.eventId,
      req.params.userId,
      req.params.message,
      new Date()
    );
    res.status(200).send("Success");
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

router.get("/messages/:eventId", async (req, res, next) => {
  try {
    let history = await chat.getChatHistory(req.params.eventId);
    res.status(200).json(history);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

router.get("/init/:eventId/:userId", async (req, res, next) => {
  res.render("chat", {
    eventId: req.params.eventId,
    userId: req.params.userId, // TODO
    accessToken: req.header("accessToken")
  });
});

module.exports = router;
