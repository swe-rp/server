const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const FacebookTokenStrategy = require('passport-facebook-token');
const config = require('../configuration/config');
const User = require('../models/user');

// JSON WEB TOKENS STRATEGY
//TODO probably want to take this out
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.JWT_SECRET
  }, async (payload, done) => {
    try {
      // Find the user specified in token
      const user = await User.findById(payload.sub);
  
      // If user doesn't exists, handle it
      if (!user) {
        return done(null, false);
      }
  
      // Otherwise, return the user
      done(null, user);
    } catch(error) {
      done(error, false);
    }
  }));

passport.use('facebookToken', new FacebookTokenStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('profile', profile);
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);

        await newUser.save();
        done(null, newUser);

        // We're in the account creation process
        let existingUser = await User.findOne({ "facebook_id": profile.id });
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
}));