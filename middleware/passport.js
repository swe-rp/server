const passport = require("passport");
const FacebookTokenStrategy = require("passport-facebook-token");
const User = require("../models/user");
const utils = require("../common/utils");

passport.use(
  "facebook-token",
  new FacebookTokenStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      passReqToCallback: true // We need this for the registration token
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        done(null, profile);
      } catch (error) {
        utils.log(error);
        done(error, false, error.message);
      }
    }
  )
);
