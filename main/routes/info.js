/**
 * Page about game info, no login required
 *
 * Created by kc on 08.05.15.
 */
'use strict';


var express = require('express');
var router = express.Router();
var _ = require('lodash');

var settings = require('../settings');
var gameplayModel = require('../../common/models/gameplayModel');
var pricelist = require('../../common/lib/pricelist');

var ngFile = '/js/indexctrl.js';
if (settings.minifedjs) {
  ngFile = '/js/indexctrl.min.js'
}

/* GET home page. */
router.get('*', function (req, res) {
  var gameId = _.trimLeft(req.url, '/');

  gameplayModel.getGameplay(gameId, null, function (err, gp) {
    if (!gp) {
      gp = {};
    }
    var errMsg1 = '';
    if (err) {
      errMsg1 = err.message;
    }
    pricelist.getPricelist(gameId, function (err2, pl) {
      if (!pl) {
        pl = {};
      }
      var errMsg2 = '';
      if (err2) {
        errMsg2 = err2.message;
      }
      res.render('info', {
        title: 'Ferropoly',
        err: errMsg1,
        err2: errMsg2,
        gameplay: JSON.stringify(gp),
        pricelist: JSON.stringify(pl)
      });
    });

  });


});


module.exports = router;
