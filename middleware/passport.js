const passport = require("passport");
const FacebookTokenStrategy = require("passport-facebook-token");
const config = require("../configuration/config");
const User = require("../models/user");

passport.use(
  "facebookToken",
  new FacebookTokenStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // We're in the account creation process
        let existingUser = await User.findOne({ facebook_id: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          facebook_id: profile.id
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
