const model_names = require("./shared");
const mongoose = require("mongoose");

let planSchema = mongoose.Schema({
  name: { type: String, required: true },
  member_list: [
    { type: mongoose.Schema.Types.ObjectId, ref: model_names.USER }
  ],
  event_list: [
    { type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT }
  ],
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true }
});

module.exports = mongoose.model(model_names.PLAN, planSchema);
