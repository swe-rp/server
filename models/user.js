var model_names = require('./shared');

var mongoose = require('mongoose');
var userSchema = mongoose.Schema;

userSchema = mongoose.Schema({
	name: {type: String, required: true},
	username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    friends_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    attended_events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
    going_events_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
    plans_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.PLAN} ],
});

var User = mongoose.model(model_names.USER, userSchema);
module.exports = User;