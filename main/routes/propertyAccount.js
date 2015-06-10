/**
 * Route for for property Account Issues
 * Created by kc on 27.05.15.
 */
'use strict';


var express = require('express');
var router = express.Router();
var propertyAccount = require('../lib/accounting/propertyAccount');
var gameCache = require('../lib/gameCache');
var logger = require('../../common/lib/logger').getLogger('routes:propertyAccount');

/**
 * Get all acount Info for a team
 */
router.get('/getRentRegister/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId || !req.params.teamId) {
    return res.send({status: 'error', message: 'No gameId/teamId supplied'});
  }

  gameCache.getGameData(req.params.gameId, function (err, data) {
    if (err) {
      logger.error(err);
      return res.send({status: 'error', message: err.message});
    }
    var gp = data.gameplay;
    var team = data.teams[req.params.teamId];

    if (!gp || !team) {
      return res.send({status: 'error', message: 'Invalid params'});
    }

    propertyAccount.getRentRegister(gp, team, function (err, register) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', register: register});
    });
  });
});

/**
 * Get all acount Info for a team
 */
router.get('/getAccountStatement/:gameId/:propertyId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId/teamId supplied'});
  }
  if (req.params.propertyId === 'undefined') {
    req.params.propertyId = undefined;
  }

  propertyAccount.getAccountStatement(req.params.gameId, req.params.propertyId, function (err, register) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', register: register});
  });

});

module.exports = router;

