const chat = require("../common/chat.js");
const express = require("express");
const router = new express.Router();
const utils = require("../common/utils");
const User = require("../common/user.js");
const auth = require("../common/auth.js");

router.get("/messages/:eventId", auth.middleware, async (req, res, next) => {
  try {
    let history = await chat.getChatHistory(req.params.eventId);
    res.status(200).json(history);
  } catch (err) {
    next({ success: false, message: err.message });
  }
});

router.get("/init/:eventId", auth.middleware, async (req, res, next) => {
  let user = await User.getUser(req.header("userId"));
  res.render("chat", {
    eventId: req.params.eventId,
    userId: user.id,
    username: user.name,
    accessToken: req.header("accessToken")
  });
});

module.exports = router;
