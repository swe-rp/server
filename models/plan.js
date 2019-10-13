var model_names = require('./shared');

var mongoose = require('mongoose');
var planSchema = mongoose.Schema;

planSchema = mongoose.Schema({
    name: {type: String, required: true},
    member_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    event_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
    start_time: {type: Date, required: true},
    end_time: {type: Date, required: true},
});

var Plan = mongoose.model(model_names.PLAN, planSchema);
module.exports = Plan;