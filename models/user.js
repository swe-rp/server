const modelNames = require("./shared");
const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // email: {type: String, required: true, unique: true},
  // friends_list: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER} ],
  // events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.EVENT} ],
  // going_events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.EVENT} ],
  // plans_list: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.PLAN} ],
  facebookId: { type: String, required: true, unique: true },
  registrationToken: { type: String, required: true },
  accessToken: { type: String, required: true, unique: true }
});

module.exports = mongoose.model(modelNames.USER, userSchema);
