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
    location_x: {type: Number},
    location_y: {type: Number},
    start_time: {type: Date},
    end_time: {type: Date},
    tag_list: [{ type: String} ],
});

var Event = mongoose.model(model_names.EVENT, eventSchema);
module.exports = Event;