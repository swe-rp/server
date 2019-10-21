const model_names = require("./shared");
const mongoose = require("mongoose");

let tagSchema = mongoose.Schema({
  name: { type: String, required: true }
  // event_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ]
});

module.exports = mongoose.model(model_names.TAG, tagSchema);
