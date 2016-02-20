/**
 *
 * Created by kc on 10.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var settings = require('../settings');
var pricelist = require('../../common/lib/pricelist');
var authTokenManager = require('../lib/authTokenManager');
var gamecache = require('../lib/gameCache');
var errorHandler = require('../lib/errorHandler');

/* GET the reception of all games */
router.get('/:gameId', function (req, res) {
  var gameId = req.params.gameId;

  gamecache.refreshCache(function (err) {
    if (err) {
      return errorHandler(res, 'Interner Fehler bei der Aktualisierung des Caches.', err, 404);
    }

    gamecache.getGameData(gameId, function (err, gamedata) {
      if (err) {
        return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
      }
      var gp = gamedata.gameplay;
      var teams = gamedata.teams;

      if (!gp || !gamedata) {
        return errorHandler(res, 'Spiel nicht gefunden.', new Error('gp or gamedata is undefined'), 500);
      }

      // As we use the gamecache, we have to check the user manually
      if (gp.internal.owner !== req.session.passport.user) {
        // Check if declared as additional admin
        if (gp.admins && gp.admins.logins && !_.find(gp.admins.logins, function (n) {
            return n === req.session.passport.user;
          })) {
          return errorHandler(res, 'Keine Berechtigung für dieses Spiel vorhanden.', new Error('Access denied'), 403);
        }
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
            return errorHandler(res, 'Interner Fehler beim Erstellen des Tokens.', err, 500);
          }
          req.session.ferropolyToken = token;

          res.render('reception', {
            title: 'Ferropoly',
            minifiedjs: settings.minifiedjs,
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

});


module.exports = router;
