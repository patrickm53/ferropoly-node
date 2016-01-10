/**
 * Statistics API
 * Created by kc on 25.05.15.
 */
'use strict';

var express         = require('express');
var router          = express.Router();
var teamAccount     = require('../lib/accounting/teamAccount');
var propertyAccount = require('../lib/accounting/propertyAccount');
var gameCache       = require('../lib/gameCache');
var logger          = require('../../common/lib/logger').getLogger('routes:statistics');
var accessor        = require('../lib/accessor');
var async           = require('async');
var _               = require('lodash');

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(401).send({status: 'error', message: err.message});
    }
    teamAccount.getRankingList(req.params.gameId, function (err, ranking) {
      if (err) {
        return res.status(500).send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', ranking: ranking});
    });
  });
});


/**
 * Get the list with the income of all teams
 */
router.get('/income/:gameId', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(401).send({status: 'error', message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.status(500).send({status: 'error', message: err.message});
      }
      var gp    = data.gameplay;
      var teams = _.values(data.teams);

      var info = [];
      async.each(teams,
        function (team, cb) {
          propertyAccount.getRentRegister(gp, team, function (err, result) {
            if (err) {
              return cb(err);
            }
            info.push(result);
            cb();
          });
        },
        function (err) {
          if (err) {
            return res.status(500).send({status: 'error', message: err.message});
          }
          res.send({status: 'ok', info: info});
        });
    });
  });
});


/**
 * Get the list with the income of a specific team
 */
router.get('/income/:gameId/:teamId', function (req, res) {

  accessor.verifyPlayer(req.session.passport.user, req.params.gameId, req.params.teamId, function (err) {
    if (err) {
      return res.status(401).send({status: 'error', message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.status(500).send({status: 'error', message: err.message});
      }

      propertyAccount.getRentRegister(data.gameplay, data.teams[req.params.teamId], function (err, result) {
        if (err) {
          return res.status(500).send({status: 'error', message: err.message});
        }
        return res.send({status: 'ok', info: result});
      });
    });
  });
});


module.exports = router;
