/**
 * The traffic route. This route is needed as we can't call another server from the javascript in the browser
 * Created by kc on 01.09.15.
 */
'use strict';

var trafficLib = require('../lib/traffic');
var express = require('express');
var router = express.Router();
var accessor = require('../lib/accessor');
var gameCache = require('../lib/gameCache');

/**
 * Get the traffic info
 */
router.get('/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function(err, gameData) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      if (!gameData || !gameData.gameplay) {
        return res.send({status:'error', message:'Gameplay not found'});
      }
      trafficLib.getTrafficInfo(gameData.gameplay.internal.map, function (err, data) {
        if (err) {
          return res.send({status: 'error', message: err.message});
        }
        res.send({status: 'ok', trafficInfo: data});
      });
    });
  });
});

module.exports = router;
