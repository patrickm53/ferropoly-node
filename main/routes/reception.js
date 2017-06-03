/**
 *
 * Created by kc on 10.05.15.
 */


const express = require('express');
const router = express.Router();
const _ = require('lodash');
const settings = require('../settings');
const pricelist = require('../../common/lib/pricelist');
const authTokenManager = require('../lib/authTokenManager');
const gamecache = require('../lib/gameCache');
const errorHandler = require('../lib/errorHandler');

/* GET the reception of all games */
router.get('/:gameId', function (req, res) {
  let gameId = req.params.gameId;

  gamecache.refreshCache(function (err) {
    if (err) {
      return errorHandler(res, 'Interner Fehler bei der Aktualisierung des Caches.', err, 404);
    }

    gamecache.getGameData(gameId, function (err, gamedata) {
      if (err) {
        return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
      }
      let gp = gamedata.gameplay;
      let teams = gamedata.teams;

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

      let errMsg1 = '';

      pricelist.getPricelist(gameId, function (err2, pl) {
        if (!pl) {
          pl = {};
        }
        let errMsg2 = '';
        if (err2) {
          errMsg2 = err2.message;
        }

        authTokenManager.getNewToken(req.session.passport.user, function (err, token) {
          if (err) {
            return errorHandler(res, 'Interner Fehler beim Erstellen des Tokens.', err, 500);
          }
          req.session.ferropolyToken = token;

          res.render('reception/reception', {
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
