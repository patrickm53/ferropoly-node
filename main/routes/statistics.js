/**
 * Statistics API
 * Created by kc on 25.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var teamAccount = require('../lib/accounting/teamAccount');
var propertyAccount = require('../lib/accounting/propertyAccount');
var gameCache = require('../lib/gameCache');
var logger = require('../../common/lib/logger').getLogger('routes:statistics');

var _ = require('lodash');

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  teamAccount.getRankingList(req.params.gameId, function(err, ranking) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status:'ok', ranking: ranking});
  });
});

/**
 * Get the list with the income of all teams
 */
router.get('/income/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }

  gameCache.getGameData(req.params.gameId, function (err, data) {
    if (err) {
      logger.error(err);
      return res.send({status: 'error', message: err.message});
    }
    var gp = data.gameplay;
    var teams = _.values(data.teams);

    // Callback for iteration
    var info = [];
    function collector(err, result) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      info.push(result);
      if (info.length === teams.length) {
        return res.send({status:'ok', info: info});
      }
    }

    // Iterate through teams
    for (var i = 0; i < teams.length; i++) {
      propertyAccount.getRentRegister(gp, teams[i], collector);
    }
  });
});
module.exports = router;
