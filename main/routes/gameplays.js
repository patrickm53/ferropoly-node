/**
 * Gameplays access
 * Created by kc on 07.04.16.
 */

const express = require('express');
const router  = express.Router();

const settings      = require('../settings');
const gameplayModel = require('../../common/models/gameplayModel');
const logger        = require('../../common/lib/logger').getLogger('routes:index');
const teams         = require('../../common/models/teamModel');
const async         = require('async');


/**
 * Get the gameplays for the user, the ones owned and the ones as player
 */
router.get('/', function (req, res) {
  gameplayModel.getGameplaysForUser(req.session.passport.user, function (err, gameplays) {
    if (err) {
      logger.error('can not get gameplays for a user', err);
      return res.status(500).send({message: err.message});
    }
    let retVal = {success: true, gameplays: [], games: []};
    if (gameplays) {
      gameplays.forEach(function (gameplay) {
        retVal.gameplays.push({
          internal  : gameplay.internal,
          gamename  : gameplay.gamename,
          scheduling: gameplay.scheduling,
          log       : gameplay.log,
          mobile    : gameplay.mobile
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
              mobile    : gp.mobile,
              team      : team
            });
            cb();
          });
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

