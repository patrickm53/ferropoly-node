/**
 * Authtoken: used for POST and socket.io, when we need to know that the user is really logged in
 * Created by kc on 29.01.15.
 */

const express = require('express');
const router  = express.Router();
const session = require('express-session');
const uuid    = require('uuid/v4');
const logger  = require('../lib/logger').getLogger('authToken');

/* GET the authtoken, which you only can get when logged in */
router.get('/', function (req, res) {
  req.session.authToken = uuid();
  
  if (req.session.authToken) {
    logger.info(`Auth token REFRESH for ${req.session.passport.user}: ${req.session.authToken}`);
  }
  else {
    logger.info(`NEW auth token for ${req.session.passport.user}: ${req.session.authToken}`);
  }

  res.send({authToken: req.session.authToken, user: req.session.passport.user});
});


module.exports = {
  init: function (app) {
    app.use('/authtoken', router);
  }
};
