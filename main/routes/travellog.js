/**
 * The travel log route
 * Created by kc on 11.06.15.
 */

const express   = require('express');
const router    = express.Router();
const travelLog = require('../../common/models/travelLogModel');
const logger    = require('../../common/lib/logger').getLogger('routes:travellog');
const accessor  = require('../lib/accessor');
const _         = require('lodash');

/**
 * Get the Travel log
 */
router.get('/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  if (!req.params.teamId) {
    return res.status(400).send({message: 'No teamId supplied'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  let teamId = req.params.teamId;
  if (req.params.teamId === 'undefined') {
    teamId = undefined;
  }

  /**
   * Collect data and send it back
   * @param tId
   */
  function collectAndSendLog(tId) {
    if (tId) {
      logger.info(`${req.params.gameId}: TravelLog Request for ${tId}`);
    }
    else {
      logger.info(`${req.params.gameId}: TravelLog Request for all teams`);
    }

    travelLog.getAllLogEntries(req.params.gameId, tId, function (err, log) {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      for (let i = 0; i < log.length; i++) {
        log[i] = _.omit(log[i], ['_id', '__v', 'gameId']);
      }
      res.send({status: 'ok', travelLog: log});
    });
  }

  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      accessor.verifyPlayer(user, req.params.gameId, teamId, err => {
        if (err) {
          return res.status(401).send({message: err.message});
        }
        // User response
        return collectAndSendLog(teamId);
      })
      return;
    }

    // Admin Response
    collectAndSendLog(teamId);
  });
});

module.exports = router;
