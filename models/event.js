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
    var update = {
        name: body.name,
        description: body.description,
        host: body.host,
        start_time: body.start_time,
        end_time: body.end_time
    }
    var updated = await EventModel.findByIdAndUpdate(id, update);
    // add push notif here
    return ({ "id": updated.id, "data": updated });
}

async function getEvents(user_id){
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate()+1);
    const query = EventModel.find();
    query.where('start_time').gte(today).lt(tomorrow);
    query.where('attendants_list').nin(user_id);
    var events = await query.exec()
    return ({"data": events});
}

async function addAttendant(id, user_id){
    const event = await EventModel.findById(id);
    event.attendants_list.push(user_id);
    const update = {
        attendants_list: event.attendants_list
    }
    const updatedEvent = await EventModel.findByIdAndUpdate(id, update);
    return ({ "id": updated.id, "data": updatedEvent });
}


module.exports = {
    "createEvent": createEvent,
    "updateEvent": updateEvent,
    "getEvents": getEvents,
    "addAttendant": addAttendant
};