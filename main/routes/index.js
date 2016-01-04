/**
 * The index route
 * Created by kc on 14.04.15.
 */
'use strict';

var express = require('express');
var router  = express.Router();

var settings      = require('../settings');
var gameplayModel = require('../../common/models/gameplayModel');
var users         = require('../../common/models/userModel');
var logger        = require('../../common/lib/logger').getLogger('routes:index');
var errorHandler  = require('../lib/errorHandler');
var teams         = require('../../common/models/teamModel');
var async         = require('async');

var ngFile = '/js/indexctrl.js';
if (settings.minifedjs) {
  ngFile = '/js/indexctrl.min.js';
}

/* GET home page. */
router.get('/', function (req, res) {
  users.getUserByMailAddress(req.session.passport.user, function (err, user) {
    if (err) {
      return errorHandler(res, 'Interner Fehler beim Laden des Users.', err, 500);
    }
    res.render('index', {
      title       : 'Ferropoly Spielauswertung',
      ngController: 'indexCtrl',
      ngApp       : 'indexApp',
      ngFile      : ngFile,
      user        : user,
      userJson    : JSON.stringify(user)
    });

  });
});

/**
 * Get the gameplays for the user, the ones owned and the ones as player
 */
router.get('/gameplays', function (req, res) {
  gameplayModel.getGameplaysForUser(req.session.passport.user, function (err, gameplays) {
    if (err) {
      logger.error('can not get gameplays for a user', err);
      return res.status(500).send({message: err.message});
    }
    var retVal = {success: true, gameplays: [], games: []};
    if (gameplays) {
      gameplays.forEach(function (gameplay) {
        retVal.gameplays.push({
          internal  : gameplay.internal,
          gamename  : gameplay.gamename,
          scheduling: gameplay.scheduling,
          log       : gameplay.log
        });
      });
    }

    teams.getMyTeams(req.session.passport.user, function (err, myTeams) {
      if (err) {
        logger.error('can not get teams for a user', err);
        return res.status(500).send({message: err.message});
      }
      if (!myTeams) {
        // No teams as player. return
        return res.send(retVal);
      }

      async.each(myTeams,
        function (team, cb) {
          // Add all gameplays for each team found
          gameplayModel.getGameplay(team.gameId, null, function (err, gp) {
            if (err) {
              return cb(err);
            }
            retVal.games.push({
              internal  : gp.internal,
              gamename  : gp.gamename,
              scheduling: gp.scheduling,
              log       : gp.log,
              team      : team
            });
            cb();
          })
        },
        function (err) {
          // That's it iterated through all found teams
          if (err) {
            logger.error('Error in async loop', err);
            return res.status(500).send({message: err.message});
          }
          res.send(retVal);
        });
    });

  });
});

module.exports = router;
