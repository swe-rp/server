const modelNames = require("./shared");
const mongoose = require("mongoose");

let eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER },
  attendantsList: [
    { type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER }
  ],
  chatMessages: [
    {
      username: { type: String, required: true },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: modelNames.USER,
        required: true
      },
      message: { type: String, required: true },
      timestamp: { type: Date, required: true }
    }
  ],
  location: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  tagList: [{ type: String }]
});

module.exports = mongoose.model(modelNames.EVENT, eventSchema);
