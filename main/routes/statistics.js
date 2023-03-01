/**
 * Statistics API
 * Created by kc on 25.05.15.
 */


const express         = require('express');
const router          = express.Router();
const teamAccount     = require('../lib/accounting/teamAccount');
const propertyAccount = require('../lib/accounting/propertyAccount');
const gameCache       = require('../lib/gameCache');
const logger          = require('../../common/lib/logger').getLogger('routes:statistics');
const accessor        = require('../lib/accessor');
const async           = require('async');
const _               = require('lodash');

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(401).send({message: err.message});
    }
    teamAccount.getRankingList(req.params.gameId, function (err, ranking) {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send({ranking: ranking});
    });
  });
});


/**
 * Get the list with the income of all teams
 */
router.get('/income/:gameId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(401).send({message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.status(500).send({message: err.message});
      }
      let gp    = data.gameplay;
      let teams = _.values(data.teams);

      let info = [];
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
            return res.status(500).send({message: err.message});
          }
          res.send({info: info});
        });
    });
  });
});


/**
 * Get the list with the income of a specific team
 */
router.get('/income/:gameId/:teamId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verifyPlayer(user, req.params.gameId, req.params.teamId, function (err) {
    if (err) {
      return res.status(401).send({message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.status(500).send({message: err.message});
      }

      propertyAccount.getRentRegister(data.gameplay, data.teams[req.params.teamId], function (err, result) {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        return res.send({info: result});
      });
    });
  });
});


module.exports = router;
