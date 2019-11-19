const express = require("express");
const passport = require("passport");
const passportConf = require("../middleware/passport");
const router = new express.Router();
const user = require("../common/user.js");

const utils = require("../common/utils");
const notifications = require("../common/notification");

router
  .route("/oauth")
  .post(
    passport.authenticate("facebook-token", { session: false }),
    async (req, res) => {
      try {
        await user.userLogin(req.user, req.header("registration_token"));
        utils.log("User authenticated", req.user);
        utils.log("Reg token:", req.header("registration_token"));
        utils.log(
          await notifications.subscribeToTopic(
            "event",
            req.user.registrationToken
          )
        );
        res.status(200).json({
          success: true,
          userId: req.user.id
        });
      } catch (e) {
        utils.error(e);
        res.status(500).send("Failure.");
      }
    }
  );

// router.put('/', async function (req, res){
//   try{
//     const update = UserModel.addEvent(req.body);
//   } catch(err) {
//     res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//   }
// });
// // Get user information
// router.get('/:id', async function (req, res) {
//   var id = req.params.id;
//   try{
//     const user = await UserModel.findById(id)
//     res.status(200).json(user);
//   } catch(err) {
//     res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//   }
// });

// router.put('/:id', async function (req, res) {
//   var id = req.params.id;
//   try{
//     var query = {
//         $and: [{ _id: id }]
//     }
//     var update = {
//         name: req.body.name,
//         email: req.body.email,
//         // visibility: req.body.visibility,
//         // location_x: req.body.location_x,
//         // location_y: req.body.location_y,
//         // startTime: req.body.startTime,
//         // endTime: req.body.endTime
//     }
//     await UserModel.findOneAndUpdate(query, update);
//     res.status(200);
//   } catch(err) {
//     res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//   }
// });

module.exports = router;
