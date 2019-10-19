var model_names = require('./shared');
var mongoose = require('mongoose');
var messageSchema = mongoose.Schema;

messageSchema = mongoose.Schema({
    sender: {type: String, required: true},
    content: {type: String, required: true},
    timeStamp: {type: Date, required:true},
    plan_id: {type: mongoose.Schema.Types.ObjectId, ref: model_names.MESSAGE}
});

var UserModel = mongoose.model(model_names.MESSAGE, messageSchema);

module.exports = UserModel;
