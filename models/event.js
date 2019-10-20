var model_names = require('./shared');

var mongoose = require('mongoose');
var eventSchema = mongoose.Schema;

eventSchema = mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    // visibility: {type: Boolean, required: true},
    // host_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    host: { type: mongoose.Schema.Types.ObjectId, ref: model_names.USER},
    // guest_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    attendants_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.USER} ],
    // location_x: {type: Number},
    // location_y: {type: Number},
    start_time: {type: Date},
    end_time: {type: Date},
    tag_list: [{ type: String} ],
});

var EventModel = mongoose.model(model_names.EVENT, eventSchema);

async function createEvent(body){
    const newEvent = new Event({
        name: body.name,
        description: body.description,
        host: body.host,
        attendants_list: [],
        start_time: body.start_time,
        end_time: body.end_time
    });
    await newEvent.save()
    return ({ "id": newEvent.id, "data": newEvent });
}

async function updateEvent(id, body){
    var query = { _id: id }
    var update = {
        name: body.name,
        description: body.description,
        host: body.host,
        start_time: body.start_time,
        end_time: body.end_time
    }
    var updated = await EventModel.findOneAndUpdate(query, update);
    return ({ "id": updated.id, "data": updated });
}

module.exports = {
    "createEvent": createEvent,
    "updateEvent": updateEvent
};