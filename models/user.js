const model_names = require("./shared");
const mongoose = require("mongoose");

let userSchema = mongoose.Schema({
  name: { type: String, required: true },
  // email: {type: String, required: true, unique: true},
  // friends_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
  // events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
  // going_events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
  // plans_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.PLAN} ],
  facebook_id: { type: String, required: true, unique: true },
  registration_token: { type: String, required: true }
});

module.exports = mongoose.model(model_names.USER, userSchema);

// async function getUser(id){
//     return await UserModel.findById(id);
// }
