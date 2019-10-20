const express = require('express');
const passport = require('passport');
const passportConf = require('../middleware/passport');
const router = express.Router();

const UserController = require('../controllers/user');
const UserModel = require('../models/user');

router.route('/oauth')
  .post(passport.authenticate('facebookToken', { session: false }), UserController.facebookOAuth);


router.put('/', async function (req, res){
  try{
    const update = UserModel.addEvent(req.body);
  } catch(err) {
    res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
  }
});
// // Get user information
// router.get('/:id', async function (req, res) {
//   var id = req.params.id;
//   try{
//     const user = await UserModel.findById(id)
//     res.status(200).json(user);
//   } catch(err) {
//     res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//   }
// });

// router.put('/:id', async function (req, res) {
//   var id = req.params.id;
//   try{
//     var query = {
//         $and: [{ _id: id }]
//     }
//     var update = {
//         name: req.body.name,
//         email: req.body.email,
//         // visibility: req.body.visibility,
//         // location_x: req.body.location_x,
//         // location_y: req.body.location_y,
//         // start_time: req.body.start_time,
//         // end_time: req.body.end_time
//     }
//     await UserModel.findOneAndUpdate(query, update);
//     res.status(200);
//   } catch(err) {
//     res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
//   }
// });

module.exports = router;