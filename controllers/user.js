const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('../configuration/config');

signToken = profile => {
  return JWT.sign({
    iss: 'Evnt',
    sub: profile.id,
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
  }, JWT_SECRET);
}

module.exports = {
  facebookOAuth: async (req, res, next) => {
    const token = signToken(req.user);
    res.cookie('access_token', token, {
      httpOnly: true
    });
    res.status(200).json({ success: true });
  },
}