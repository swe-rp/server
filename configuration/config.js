require("dotenv").config();

module.exports = {
  JWT_SECRET: "evntauth",
  facebook: {
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET
  }
};
