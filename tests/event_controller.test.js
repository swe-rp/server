// Tests the event controller

// Functions tested
//     - POST /api
//     - PUT /api/add/:id/:userId
//     - PUT /api/remove/:id/:userId
//     - PUT /api/:
//     - GET /api/avail/:userId
//     - GET /api/in/:userId
//     - GET /api/suggest/:userId
//     - GET /notify/:topic


// jest.mock('../db.js', () => {
//     const db = require('./test_db');
//     return db;
// });

const request = require('supertest');
const app = require('../index.js');
jest.setTimeout(30000);

describe('routes/event.js tests', function () {
    test('create event and returns successfully', function (done){
        let a = {
            name: "event",
            description: "event description",
            host: "123456",
            attendantsList: ["123456"],
            startTime: "12323232",
            endTime: "12323232",
            tagList: ["fun", "social"]
        };

        request(app)
            .post('/events/api')
            .send(a)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    test('throw error when creating event with missing information', function (done){
        let a = {
            name: "event",
            description: "event description",
            host: "123456",
            attendantsList: ["123456"],
            startTime: "12323232",
            tagList: ["fun", "social"]
        };

        request(app)
            .get('/events/api')
            .send(a)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(500);
    });

    test('add user to existing event and return successfully', function (done){
        
    });

    test('throw error when adding user to unexisting event', function (done){

    });

    test('throw error when adding unexisting user', function (done){

    });

    test('remove user from existing event and return successfully', function (done){

    });

    test('throw error when removing user from unexisting event', function (done){

    });

    test('update event and returns successfully', function (done){

    });

    test('throw error when updating event with missing information', function (done){

    });

    test('get available events and return successfully', function (done){

    });

    test('throw error when getting available events for unexisting user', function (done){

    });

    test('get events user is in and return successfully', function (done){

    });

    test('throw error when getting events user is in for unexisting user', function (done){

    });

    test('suggest event and return successfully', function (done){

    });

    test('throw error when suggesting event for unexisting user', function (done){

    });

    test('throw error when no there are no events to suggest', function (done){

    });



    // test('get recommendations and returns successfully', function (done) {
    //     request(app)
    //         .get('/recommendations/testUser')
    //         .set('Accept', 'application/json')
    //         .expect('Content-Type', /json/)
    //         .expect(200, done);
    // });
    
    // test('throws an error when attempting to get recommendations for non-existent user', function (done) {
    //     request(app)
    //         .get('/recommendations/idisnonexisting')
    //         .set('Accept', 'application/json')
    //         .expect('Content-Type', /json/)
    //         .expect(500) 
    //         .end((err) => {
    //             if (err) return done(err);
    //             done();
    //         });
    // });
});
