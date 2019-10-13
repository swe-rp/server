const express = require('express');
const router = express.Router();

const EventModel = require('../models/event');
const UserModel = require('../models/user');

// Event api
// Create event
router.post('/', async function (req, res) {
    const newEvent = new EventModel({
        name : req.body.name,
        description : req.body.description,
        visibility: req.body.visibility,
        // location_x: req.body.location_x,
        // location_y: req.body.location_y,
        // start_time: req.body.start_time,
        // end_time: req.body.end_time,
    });
    try{
        await newEvent.save();
        res.status(200).json(newEvent);
    }catch(err){
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
});

router.get('/', function (req, res){
    try{
        var allEvents = await EventModel.find();
        res.status(200).json(allEvents);
    }catch(err){
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
})

// Edit event, changed public/private, changed time or location
// app.put('/events', passportJWT, function (req, res) {
//     console.log("Editing events");
//     res.send('Hello World!');
// });

// // Delete event
// app.delete('/events', passportJWT, function (req, res) {
//     console.log("Deleting events");
//     res.send('Hello World!');
// });

// // Get suggested event for user
router.get('/events/suggest/:user_id', function (req, res) {
    var user_id = req.params.user_id;
    try{
        var user = UserModel.findOne({facebook_id: user_id}).populate(attended_events_list);
        var tagFreq = {};
        user.attended_events_list.forEach(event => {
            event.tag_list.forEach(tag => {
                if(!tagFreq[tag])
                    tagFreq[tag] = 0;
                tagFreq[tag] = tagFreq[tag] + 1;
            });
        });
        var events = getVisibleEventsForUser();
        if(events.length == 0)
            res.status(409).send({ success: false, message: "no events for you" });
        var best_event = events[0];
        var best_score = getEventScoreForUser(tagFreq, user.friends_list, events[0])
        for(var i = 1; i < events.length; i++){
            var score = getEventScoreForUser(tagFreq, user.friends_list, events[i]);
            if(score > best_score){
                best_score = score;
                best_event = events[i];
            }
        }
        res.status(200).json(best_event);
    }catch(err){
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
});

// Get all events for user, used in browse events
router.get('/events/:user_id', function (req, res) {
    var user_id = req.params.id;
    try{
        var events = getVisibleEventsForUser(user_id);
        res.status(200).json(events);
    }catch(err){
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
});

async function getEventScoreForUser(tagFreq, friends_list, event){
    var score = 0;
    friends_list.forEach(friend => {
        if(event.attendants_list.includes(friend))
            score += 30;
    });
    event.tag_list.forEach(tag => {
        if(tagFreq[tag])
            score += 5 * tagFreq[tag];
    });
    return score;
}

async function getVisibleEventsForUser(user_id){
    var query = {
        $or: [{visibility: true}, {guest_list: user_id}, 
            {host_list: user_id}
        ]
    }
    return EventModel.find(query);
}

module.exports = router ;