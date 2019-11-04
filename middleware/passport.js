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
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // We're in the account creation process
        let existingUser = await User.findOne({ facebookId: profile.id });

        if (existingUser) {
          existingUser.registrationToken = req.header("registration_token");
          await User.findByIdAndUpdate(existingUser.id, existingUser);
          return done(null, existingUser);
        }

        let newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          facebookId: profile.id,
          registrationToken: req.header("registration_token")
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        utils.log(error);
        done(error, false, error.message);
      }
    }
  )
);
