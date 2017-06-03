/**
 * Access to the gamecache
 * Created by kc on 17.08.15.
 */


const express = require('express');
const router = express.Router();
const gamecache = require('../lib/gameCache');
const gameScheduler = require('../lib/gameScheduler');
const logger = require('../../common/lib/logger').getLogger('routes:gamecache');

/**
 * Refreshing the game cache
 */
router.post('/refresh', function (req, res) {
  gamecache.refreshCache(function(err) {
    if (err) {
      logger.error('can not refresh cache', err);
      return res.status(500).send({message: 'refreshCache error: ' + err.message});
    }
    gameScheduler.update(function(err) {
      if (err) {
        logger.error('can not update scheduler', err);
        res.send({status:'error', message:err.message});
        return res.status(500).send({message: 'gameScheduler.update error: ' + err.message});
      }
      logger.info('Cache and scheduler updated');
      res.send({status:'ok'});
    });
  });
});

module.exports = router;
