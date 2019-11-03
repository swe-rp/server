const modelNames = require("./shared");
const mongoose = require("mongoose");

let tagSchema = mongoose.Schema({
  name: { type: String, required: true }
  // eventList: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.EVENT} ]
});

module.exports = mongoose.model(modelNames.TAG, tagSchema);
