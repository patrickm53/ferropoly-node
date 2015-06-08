/**
 * Authtoken: used for POST and socket.io, when we need to know that the user is really logged in
 * Created by kc on 29.01.15.
 */
'use strict';
var express = require('express');
var router = express.Router();
var session = require('express-session');
var uuid = require('node-uuid');
var logger = require('../lib/logger').getLogger('authToken');

/* GET the authtoken, which you only can get when logged in */
router.get('/', function (req, res) {
  if (!req.session.authToken) {
    req.session.authToken = uuid.v4();
  }
  logger.info(req.session.AuthToken);

  res.send({authToken: req.session.authToken, user: req.session.passport.user});
});


module.exports = {
  init: function (app) {
    app.use('/authtoken', router);
  }
};
