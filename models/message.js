const model_names = require("./shared");
const mongoose = require("mongoose");

let messageSchema = mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timeStamp: { type: Date, required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: model_names.MESSAGE }
});

module.exports = mongoose.model(model_names.MESSAGE, messageSchema);
