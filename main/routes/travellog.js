/**
 * The travel log route
 * Created by kc on 11.06.15.
 */
'use strict';
var express = require('express');
var router = express.Router();
var travelLog = require('../../common/models/travelLogModel');
var logger = require('../../common/lib/logger').getLogger('routes:travellog');

var _ = require('lodash');

/**
 * Get the ranking list
 */
router.get('/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (!req.params.teamId) {
    return res.send({status: 'error', message: 'No teamId supplied'});
  }
  logger.debug('Request for ' + req.params.teamId + ' @ ' + req.params.gameId);
  var teamId = req.params.teamId;
  if (req.params.teamId === 'undefined') {
    teamId = undefined;
  }
  travelLog.getAllLogEntries(req.params.gameId, teamId, function (err, log) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    for (var i = 0; i < log.length; i++) {
      log[i] = _.omit(log[i], ['_id', '__v', 'gameId']);
    }
    res.send({status: 'ok', travelLog: log});
  });
});

module.exports = router;
