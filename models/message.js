const modelNames = require("./shared");
const mongoose = require("mongoose");

let messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timeStamp: { type: Date, required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: modelNames.MESSAGE }
});

module.exports = mongoose.model(modelNames.MESSAGE, messageSchema);
