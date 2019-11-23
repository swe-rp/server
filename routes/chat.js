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
      req.params.message
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

// // Send message
// router.post('/', async function (req, res) {
//     try {
//         const newMessage = new MessageModel({
//             sender: req.body.sender,
//             content: req.body.content,
//             timeStamp: req.body.timeStamp,
//             plan_id: req.body.plan_id
//         });
//         await newMessage.save();
//         var message = {
//             data: {
//                 content: newMessage.content
//             },
//             topic: newMessage.plan_id
//         }
//         admin.messaging().send(message)
//             .then((response) => {
//                 // Response is a message ID string.
//                 console.log(`Successfully sent message to topic: ${message.topic}`, response);
//             })
//             .catch((error) => {
//                 console.log(`Error sending message to topic: ${message.topic}`, error);
//             });
//         res.status(200);
//     } catch (err) {
//         res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//     }
// });

// router.get('/:plan_id', async function(req, res){
//     try{
//         var messages = await MessageModel.find({plan_id: req.params.plan_id})
//                             .sort('-timestamp');
//         res.status(200).json(messages);
//     }
//     catch (err) {
//         res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//     }
// });

module.exports = router;
