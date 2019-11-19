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

// const request = require('supertest');
const app = require('../app.js');
jest.setTimeout(30000);

describe('routes/event.js tests', function () {
    it('create event and returns successfully', function (done){

    });

    it('throw error when creating event with missing information', function (done){

    });

    it('add user to existing event and return successfully', function (done){

    });

    it('throw error when adding user to unexisting event', function (done){

    });

    it('throw error when adding unexisting user', function (done){

    });

    it('remove user from existing event and return successfully', function (done){

    });

    it('throw error when removing user from unexisting event', function (done){

    });

    it('update event and returns successfully', function (done){

    });

    it('throw error when updating event with missing information', function (done){

    });

    it('get available events and return successfully', function (done){

    });

    it('throw error when getting available events for unexisting user', function (done){

    });

    it('get events user is in and return successfully', function (done){

    });

    it('throw error when getting events user is in for unexisting user', function (done){

    });

    it('suggest event and return successfully', function (done){

    });

    it('throw error when suggesting event for unexisting user', function (done){

    });

    it('throw error when no there are no events to suggest', function (done){

    });



    // it('get recommendations and returns successfully', function (done) {
    //     request(app)
    //         .get('/recommendations/testUser')
    //         .set('Accept', 'application/json')
    //         .expect('Content-Type', /json/)
    //         .expect(200, done);
    // });
    
    // it('throws an error when attempting to get recommendations for non-existent user', function (done) {
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
