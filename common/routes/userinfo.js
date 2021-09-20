/**
 * Gets info about the user logged in
 * Created by kc on 29.12.15.
 */

const express   = require('express');
const router    = express.Router();
const userModel = require('../models/userModel');
const logger    = require('../lib/logger').getLogger('userinfo');
const gravatar  = require('../lib/gravatar');

/* GET info about the user */
router.get('/', function (req, res) {
  userModel.getUserByMailAddress(req.session.passport.user, function (err, user) {
    user = user.toObject();
    if (err) {
      logger.error('Error in userinfo', err);
      res.status(500);
      res.send('Fehler bei Abfrage: ' + err.message);
      return;
    }

    // Remove some information not needed at client side
    delete user.login;
    delete user._id;
    delete user.__v;

    // Generate gravatar URL 'on the fly'
    user.info.generatedAvatar = gravatar.getUrl(user.personalData.email);

    res.send({success: true, info: user});
  });
});


module.exports = router;
