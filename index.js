const port = 3000;
const express = require('express');
const app = express();

app.use(express.json());

const mongoose = require('mongoose');
const dbHost = 'mongodb://localhost:27017/Evnt';
mongoose.connect(dbHost, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to db");
});

var User = require('./models/user.js');
var Plan = require('./models/plan.js');
var Event = require('./models/event.js');


app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});

// Event api
// Create event
app.post('/events', function (req, res) {
    console.log("Creating events");
    res.send('Hello World!');
});

// Edit event, changed public/private, changed time or location
app.put('/events', function (req, res) {
    console.log("Editing events");
    res.send('Hello World!');
});

// Delete event
app.delete('/events', function (req, res) {
    console.log("Deleting events");
    res.send('Hello World!');
});

// Get suggested event for user
app.get('/events/suggest/:_user_id', function (req, res) {
    console.log("Get suggested event for user");
    res.send('Hello World!');
});

// Get all events for user, used in browse events
app.get('/events/:_user_id', function (req, res) {
    console.log("Get all events visible for user");
    res.send('Hello World!');
});









// Plan api
// Create plan
app.post('/plans', function (req, res) {
    console.log("Creating plan");
    res.send('Hello World!');
});

// Edit plan, new people added to plan, new event added to plan
app.put('/plans', function (req, res) {
    console.log("Editing plan");
    res.send('Hello World!');
});

// Delete plan
app.delete('/plans', function (req, res) {
    console.log("Deleting plan");
    res.send('Hello World!');
});

// Get all plans for user
app.get('/plans/:_user_id', function (req, res) {
    console.log("Get all plans visible for user");
    res.send('Hello World!');
});






// TODO we probably want an api for check user friends etc
// Get user information
app.get('/user/:_user_id', function (req, res) {
    console.log("Get info for user");
    res.send('Hello World!');
});



// Testing api
// TODO this should be taken out
app.post(
    '/test',
    (req, res) => {
        console.log("here");
        console.log(req.body);
        res.json({ "a": "dumb" });
    }
);

app.get('/', function (req, res) {
    res.send('Hello World!');
});