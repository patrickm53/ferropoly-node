/**
 * Chancellery route
 * Created by kc on 28.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var chancellery = require('../lib/accounting/chancelleryAccount');
var gameCache = require('../lib/gameCache');
var _ = require('lodash');

/**
 * Get the amount of the chancellery
 */
router.get('/balance/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }

  chancellery.getBalance(req.params.gameId, function(err, data) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', data: data});
  });
});

/**
 * Get all account entries of the chancellery
 */
router.get('/accountStatement/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }

  chancellery.getAccountStatement(req.params.gameId, function(err, data) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', entries: data});
  });
});

/**
 * play chancellery
 */
router.get('/playChancellery/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId || !req.params.teamId) {
    return res.send({status: 'error', message: 'No gameId or teamId supplied'});
  }
  gameCache.getGameData(req.params.gameId, function (err, data) {
    if (err) {
      console.error(err);
      return res.send({status: 'error', message: err.message});
    }
    var gp = data.gameplay;
    var team = data.teams[req.params.teamId];

    chancellery.playChancellery(gp, team, function (err, data) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', result: data});
    });
  });
});

/**
 * Gambling
 */
router.post('/gamble/:gameId/:teamId', function (req, res) {
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  if (!req.params.gameId || !req.params.teamId || !req.body.amount) {
    return res.send({status: 'error', message: 'No gameId, teamId or amount supplied'});
  }
  var amount = parseInt(req.body.amount);
  if (!_.isNumber(amount)) {
    return res.send({status: 'error', message: 'amount is not a number'});
  }
  gameCache.getGameData(req.params.gameId, function (err, data) {
    if (err) {
      console.error(err);
      return res.send({status: 'error', message: err.message});
    }
    var gp = data.gameplay;
    var team = data.teams[req.params.teamId];

    chancellery.gamble(gp, team, amount, function (err, data) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', result: data});
    });
  });
});
module.exports = router;
