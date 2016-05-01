/**
 * Access to the gamecache
 * Created by kc on 17.08.15.
 */


var express = require('express');
var router = express.Router();
var gamecache = require('../lib/gameCache');
var gameScheduler = require('../lib/gameScheduler');
var logger = require('../../common/lib/logger').getLogger('routes:gamecache');

/**
 * Get the ranking list
 */
router.post('/refresh', function (req, res) {
  gamecache.refreshCache(function(err) {
    if (err) {
      logger.error('can not refresh cache', err);
      res.send({status:'error', message:err.message});
      return;
    }
    gameScheduler.update(function(err) {
      if (err) {
        logger.error('can not update scheduler', err);
        res.send({status:'error', message:err.message});
        return;
      }
      logger.info('Cache and scheduler updated');
      res.send({status:'ok'});
    });
  });
});

module.exports = router;
