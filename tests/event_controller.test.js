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
const TestData = require("./test_data");

// const request = require('supertest');
const app = require("../index.js");

describe("routes/event.js tests", function() {
  test("create event and returns successfully", function(done) {
    request(app)
      .post("/events/api")
      .send(TestData.completeEvent)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  test("throw error when creating event with missing information", function(done) {
    request(app)
      .post("/events/api")
      .send(TestData.incompleteEvent)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500);
  });

  test("add user to existing event and return successfully", function(done) {
    request(app)
      .put(
        `/events/api/add/${TestData.eventArray[0].id}/${TestData.eventArray[0].id}`
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  test("throw error when adding user to unexisting event", function(done) {
    request(app)
      .put(`/events/api/add/missing/${TestData.eventArray[0].id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500);
  });

  test("throw error when adding unexisting user", function(done) {
    request(app)
      .put(`/events/api/add/${TestData.eventArray[0].id}/missing`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500);
  });

  test("remove user from existing event and return successfully", function(done) {
    request(app)
      .put(
        `/events/api/remove/${TestData.eventArray[0].id}/${TestData.eventArray[0].id}`
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  test("throw error when removing user from unexisting event", function(done) {
    request(app)
      .put(`/events/api/remove/missing/${TestData.eventArray[0].id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500);
  });

  test("update event and returns successfully", function(done) {
    let updated = Object.assign({}, TestData.eventArray[0]);
    updated.description = "new description";
    request(app)
      .put(`/events/api/${TestData.eventArray[0].id}`)
      .send(updated)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  test("throw error when updating event with missing information", function(done) {
    let updated = Object.assign({}, TestData.eventArray[0]);
    updated.description = null;
    request(app)
      .put(`/events/api/${TestData.eventArray[0].id}`)
      .send(updated)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(500);
  });

  test("get available events and return successfully", function(done) {});

  test("throw error when getting available events for unexisting user", function(done) {});

  test("get events user is in and return successfully", function(done) {});

  test("throw error when getting events user is in for unexisting user", function(done) {});

  test("suggest event and return successfully", function(done) {});

  test("throw error when suggesting event for unexisting user", function(done) {});

  test("throw error when no there are no events to suggest", function(done) {});

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
