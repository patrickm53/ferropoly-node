/**
 * The index route
 * Created by kc on 14.04.15.
 */
'use strict';

var express = require('express');
var router = express.Router();

var settings = require('../settings');
var gameplayModel = require('../../common/models/gameplayModel');
var users = require('../../common/models/userModel');
var logger = require('../../common/lib/logger').getLogger('routes:index');

var ngFile = '/js/indexctrl.js';
if (settings.minifedjs) {
  ngFile = '/js/indexctrl.min.js';
}

/* GET home page. */
router.get('/', function (req, res) {
  users.getUserByMailAddress(req.session.passport.user, function (err, user) {
    if (err) {
      logger.error('error while getting user by email', err);
      user = {};
    }
    res.render('index', {
      title: 'Ferropoly Spielauswertung',
      ngController: 'indexCtrl',
      ngApp: 'indexApp',
      ngFile: ngFile,
      user: user,
      userJson: JSON.stringify(user)
    });

  });
});

router.get('/gameplays', function (req, res) {
  gameplayModel.getGameplaysForUser(req.session.passport.user, function (err, gameplays) {
    if (err) {
      logger.error('can not get gameplays for a user', err);
      return res.send({success: false, message: err.message});
    }
    var retVal = {success: true, gameplays: []};
    if (gameplays) {
      gameplays.forEach(function (gameplay) {
        retVal.gameplays.push({
          internal: gameplay.internal,
          gamename: gameplay.gamename,
          scheduling: gameplay.scheduling,
          log: gameplay.log
        });
      });
    }
    return res.send(retVal);
  });
});

module.exports = router;
