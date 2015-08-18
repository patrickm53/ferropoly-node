/**
 * Access to the gamecache
 * Created by kc on 17.08.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var gamecache = require('../lib/gameCache');
var gameScheduler = require('../lib/gameScheduler');
/**
 * Get the ranking list
 */
router.post('/refresh', function (req, res) {
  gamecache.refreshCache(function(err) {
    if (err) {
      res.send({status:'error', message:err.message});
      return;
    }
    gameScheduler.update(function(err) {
      if (err) {
        res.send({status:'error', message:err.message});
        return;
      }
      res.send({status:'ok'});
    });
  });
});

module.exports = router;
