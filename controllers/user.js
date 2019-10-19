const JWT = require("jsonwebtoken");

signToken = user => {
  return JWT.sign({
    iss: 'Evnt',
    sub: user.id,
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
  }, process.env.JWT_SECRET);
}

module.exports = {
  facebookOAuth: async (req, res) => {
    const token = signToken(req.user);
    res.cookie("access_token", token, {
      httpOnly: true
    });
    res.status(200).json({ success: true });
  }
};
