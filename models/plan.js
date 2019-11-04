const modelNames = require("./shared");
const mongoose = require("mongoose");

let planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  memberList: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.USER }],
  eventList: [{ type: mongoose.Schema.Types.ObjectId, ref: modelNames.EVENT }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

module.exports = mongoose.model(modelNames.PLAN, planSchema);
