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
    async (req, res, next) => {
      try {
        let userValue = await user.userLogin(
          req.user,
          req.header("registration_token")
        );
        utils.log("User authenticated", req.user);
        utils.log("Reg token:", req.header("registration_token"));
        utils.log(
          await notifications.subscribeToTopic(
            "event",
            req.header("registration_token")
          )
        );
        res.status(200).json({
          success: true,
          userId: userValue.id,
          accessToken: userValue.accessToken
        });
      } catch (e) {
        next(e);
      }
    }
  );

module.exports = router;
