const express = require('express');
const passport = require('passport');
const passportConf = require('../middleware/passport');
const router = express.Router();

const UserController = require('../controllers/user');
const UserModel = require('../models/user');

router.route('/oauth')
  .post(passport.authenticate('facebookToken', { session: false }), UserController.facebookOAuth);

// Get user information
router.get('/:id', async function (req, res) {
  var id = req.params.id;
  try{
    const user = await UserModel.findById(id)
    res.status(200).json(user);
  }catch(err){
    res.status(err.code >= 100 && err.code < 600 ? err.code : 500).send({ success: false, message: err.message });
  }
});

module.exports = router ;