const modelNames = require("./shared");
const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facebookId: { type: String, required: true, unique: true },
  registrationToken: { type: String, required: true },
  accessToken: { type: String, required: true, unique: true }
});

module.exports = mongoose.model(modelNames.USER, userSchema);
