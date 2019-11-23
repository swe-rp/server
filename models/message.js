const modelNames = require("./shared");
const mongoose = require("mongoose");

let messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: modelNames.USER,
    required: true
  },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true }
});

module.exports = mongoose.model(modelNames.MESSAGE, messageSchema);
