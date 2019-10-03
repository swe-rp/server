var model_names = require('./shared');

var mongoose = require('mongoose');
var eventSchema = mongoose.Schema;

eventSchema = mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    visibility: {type: Boolean, required: true},
    host_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    guest_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    attendants_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    location_x: {type: Number, required: true},
    location_y: {type: Number, required: true},
    start_time: {type: Date, required: true},
    end_time: {type: Date, required: true},
});

var Event = mongoose.model(model_names.EVENT, eventSchema);
module.exports = Event;