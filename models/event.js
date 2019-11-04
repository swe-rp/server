const modelNames = require("./shared");
const mongoose = require("mongoose");

let eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  // visibility: {type: Boolean, required: true},
  // host_list: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER} ],
  host: { type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER },
  // guest_list: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER} ],
  attendantsList: [
    { type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER }
  ],
  // location_x: {type: Number},
  // location_y: {type: Number},
  startTime: { type: Date },
  endTime: { type: Date },
  tagList: [{ type: String }]
});

module.exports = mongoose.model(modelNames.EVENT, eventSchema);
