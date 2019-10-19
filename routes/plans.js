const express = require('express');
const router = express.Router();

var admin = require('firebase-admin');

const PlanModel = require('../models/plan');
const EventModel = require('../models/event');
const UserModel = require('../models/user');

// Event api
// Create plan
router.post('/', async function (req, res) {
    try {
        const newPlan = new EventModel({
            name: req.body.name,
            member_list: req.body.member_list,
            // event_list: [{ type: mongoose.Schema.Types.ObjectId, ref: model_names.EVENT} ],
            // start_time: {type: Date, required: true},
            // end_time: {type: Date, required: true},
        });
        await newPlan.save();
        var registrationTokens = [];
        newPlan.member_list.forEach(async (member_id) => {
            var token = (await UserModel.findById(member_id)).registrationToken;
            registrationTokens.push(token);
        });
        admin.messaging().subscribeToTopic(registrationTokens, newPlan._id)
            .then(function (response) {
                // See the MessagingTopicManagementResponse reference documentation
                // for the contents of response.
                console.log(`Successfully subscribed to topic: ${newPlan._id}`, response);
            })
            .catch(function (error) {
                console.log(`Error subscribing to topic: ${newPlan._id}`, error);
            });
        res.status(200).json(newEvent);
    } catch (err) {
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
});

router.get('/', async function (req, res) {
    try {
        var allPlans = await PlanModel.find();
        res.status(200).json(allPlans);
    } catch (err) {
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
})

// Edit event, changed public/private, changed time or location
router.put('/:user_id', async function (req, res) {
    var user_id = req.params.user_id;
    try {
        var query = {
            $and: [{ _id: req.body._id }]
        }
        var update = {
            name: req.body.name,
            member_list: req.body.member_list,
            // visibility: req.body.visibility,
            // location_x: req.body.location_x,
            // location_y: req.body.location_y,
            // start_time: req.body.start_time,
            // end_time: req.body.end_time
        }
        await PlanModel.findOneAndUpdate(query, update);
        var message = {
            data: {
                content: `${update.name} plan was updated`
            },
            topic: req.body._id
        }
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log(`Successfully sent message to topic: ${message.topic}`, response);
            })
            .catch((error) => {
                console.log(`Error sending message to topic: ${message.topic}`, error);
            });
        res.status(200);
    } catch (err) {
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
});

// // Delete event
router.delete('/:user_id', async function (req, res) {
    var user_id = req.params.user_id;
    try {
        var query = {
            $and: [{ _id: req.body._id }]
        }
        await PlanModel.remove(query);
        //TODO notify on delete
        res.status(200);
    } catch (err) {
        res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
    }
});

module.exports = router;