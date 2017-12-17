/**
 * The traffic route. This route is needed as we can't call another server from the javascript in the browser
 * Created by kc on 01.09.15.
 */


const trafficLib = require('../lib/traffic');
const express    = require('express');
const router     = express.Router();
const accessor   = require('../lib/accessor');
const gameCache  = require('../lib/gameCache');

/**
 * Get the traffic info
 */
router.get('/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, gameData) {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!gameData || !gameData.gameplay) {
        return res.status(500).send({message: 'Gameplay not found'});
      }
      trafficLib.getTrafficInfo(gameData.gameplay.internal.map, function (err, data) {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send({trafficInfo: data});
      });
    });
  });
});

module.exports = router;
