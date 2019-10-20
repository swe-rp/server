var model_names = require('./shared');
var mongoose = require('mongoose');
var userSchema = mongoose.Schema;

userSchema = mongoose.Schema({
	name: {type: String, required: true},
    // email: {type: String, required: true, unique: true},
    // friends_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    // events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
    // going_events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
    // plans_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.PLAN} ],
    facebook_id: {type: String, required: true, unique:true},
    registrationToken: {type: String, required:true}
});

var UserModel = mongoose.model(model_names.USER, userSchema);

async function getUser(id){
    return await UserModel.findById(id);
}

module.exports = {
    "addEvent": addEvent
};
