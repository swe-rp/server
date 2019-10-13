const port = 3000;
const app = require('express')();
http = require('http').createServer(app);

//oauth
const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

//database
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Evnt",function(err){
     if(err) console.log(err);
});

//firebase
var admin = require('firebase-admin');
var serviceAccount = require('./ServiceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//routes
const users = require('./routes/users');
const events = require('./routes/events');
const plans = require('./routes/plans');

//middleware
app.use(express.json());
app.use('/users', users);
app.use('/events', events);
app.use('/plans', plans);

//testing endpoints
app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});

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





// Plan api
// Create plan
// app.post('/plans', passportJWT, function (req, res) {
//     console.log("Creating plan");
//     res.send('Hello World!');
// });

// // Edit plan, new people added to plan, new event added to plan
// app.put('/plans', passportJWT, function (req, res) {
//     console.log("Editing plan");
//     res.send('Hello World!');
// });

// // Delete plan
// app.delete('/plans', passportJWT, function (req, res) {
//     console.log("Deleting plan");
//     res.send('Hello World!');
// });

// // Get all plans for user
// app.get('/plans/:_user_id', passportJWT, function (req, res) {
//     console.log("Get all plans visible for user");
//     res.send('Hello World!');
// });

// function errorHandler(err, res){
//     if(err)
//         res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
// }

