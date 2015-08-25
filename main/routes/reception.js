/**
 *
 * Created by kc on 10.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');

var settings = require('../settings');
var gameplayModel = require('../../common/models/gameplayModel');
var pricelist = require('../../common/lib/pricelist');
var teamModel = require('../../common/models/teamModel');
var authTokenManager = require('../lib/authTokenManager');
var logger = require('../../common/lib/logger').getLogger('routes:reception');
var gamecache = require('../lib/gameCache');

/* GET the reception of all games */
router.get('/:gameId', function (req, res) {
  var gameId = req.params.gameId;

  gamecache.getGameData(gameId, function (err, gamedata) {
    if (err) {
      return res.status(404).send('Error 404: Game not found');
    }
    var gp = gamedata.gameplay;
    var teams = gamedata.teams;

    if (!gp || !gamedata) {
      return res.status(404).send('Error 404: Game not found');
    }

    // As we use the gamecache, we have to check the user manually
    if (!gp || gp.owner.organisatorEmail !== req.session.passport.user) {
      return res.status(403).send('Error 403: Access denied');
    }

    var errMsg1 = '';

    pricelist.getPricelist(gameId, function (err2, pl) {
      if (!pl) {
        pl = {};
      }
      var errMsg2 = '';
      if (err2) {
        errMsg2 = err2.message;
      }

      authTokenManager.getNewToken(req.session.passport.user, function (err, token) {
        if (err) {
          logger.error(err);
        }
        req.session.ferropolyToken = token;

        res.render('reception', {
          title: 'Ferropoly',
          minifedjs: settings.minifedjs,
          ngFile: '/js/infoctrl.js',
          hideLogout: true,
          authToken: token,
          user: req.session.passport.user,
          err: errMsg1,
          err2: errMsg2,
          socketUrl: 'http://' + settings.socketIoServer.host + ':' + settings.socketIoServer.port,
          gameplay: JSON.stringify(gp),
          pricelist: JSON.stringify(pl),
          teams: JSON.stringify(_.values(teams)),
          currentGameId: gameId
        });
      });
    });
  });
});


module.exports = router;
