const express = require('express');
const app = express();
const fs = require("fs");
const https = require("https");

//oauth
const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

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
const messages = require('./routes/messages');

//middleware
app.use(express.json());
app.use('/users', users);
app.use('/events', events);
app.use('/plans', plans);
app.use('/messages', messages);

let privKey = fs.readFileSync(process.env.SSL_KEY_PATH);
let certificate = fs.readFileSync(process.env.SSL_CERT_PATH);

https.createServer({
    key: privKey,
    cert: certificate
}, app).listen(process.env.PORT);

app.post(
    '/test',
    (req, res) => {
        console.log("here");
        console.log(req.body);
        res.json({ "a": "dumb" });
    }
);

app.get('/', function (req, res) {
    res.send('Empty endpoint!');
});
