/**
 * Join a game
 * Created by kc on 05.02.16.
 */


var express = require('express');
var router = express.Router();
var gameCache = require('../lib/gameCache');
var settings = require('../settings');

var ngFile = '/js/joinctrl.js';
if (settings.minifedjs) {
  ngFile = '/js/joinctrl.min.js';
}


router.get('/:gameId', function(req, res) {
  gameCache.getGameData(req.params.gameId, function(err, gameData) {
    var gameplay = {};
    if (gameData  && gameData.gameplay) {
      gameplay = gameData.gameplay;
    }

    res.render('join', {
      title       : 'Ferropoly Spielauswertung',
      ngFile      : ngFile,
      gameplay    : JSON.stringify(gameplay)
    });
  });
});


module.exports = router;
