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
const messages = require('./routes/messages');

//middleware
app.use(express.json());
app.use('/users', users);
app.use('/events', events);
app.use('/plans', plans);
app.use('/messages', messages);

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