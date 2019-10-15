const express = require('express');
const app = express();

//oauth
const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

//routes
const users = require('./routes/users');
const events = require('./routes/events');
const plans = require('./routes/plans');

// env
const env = require('dotenv').config();
const port = 3000;
//database
const mongoose = require('mongoose');
mongoose.connect(process.env.COSMOSDB_CONNSTR+"?ssl=true&replicaSet=globaldb", {
  auth: {
    user: process.env.COSMODDB_USER,
    password: process.env.COSMOSDB_PASSWORD
  }
})
.then(() => console.log('Connection to CosmosDB successful'))
.catch((err) => console.error(err));

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
