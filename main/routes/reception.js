/**
 * Reception route
 * Created by kc on 10.05.15.
 */


const express          = require('express');
const router           = express.Router();
const _                = require('lodash');
const settings         = require('../settings');
const pricelist        = require('../../common/lib/pricelist');
const authTokenManager = require('../lib/authTokenManager');
const gamecache        = require('../lib/gameCache');
const errorHandler     = require('../lib/errorHandler');
const gameCache        = require('../lib/gameCache');
const path             = require('path');


/**
 * Send HTML Page
 */
router.get('/:gameId', function (req, res) {
  gameCache.getGameData(req.params.gameId, (err, gameData) => {
    if (err || !gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'reception.html'));
  });
});


/* GET static data of a ga,e */
router.get('/static/:gameId', function (req, res) {
  let gameId = req.params.gameId;

  gamecache.refreshCache(function (err) {
    if (err) {
      return res.status(404).send({message: 'Interner Fehler bei der Aktualisierung des Caches.'});
    }

    gamecache.getGameData(gameId, function (err, gamedata) {
      if (err) {
        return res.status(404).send({message: 'Spiel nicht gefunden.'});
      }
      let gp    = gamedata.gameplay;
      let teams = gamedata.teams;

      if (!gp || !gamedata) {
        return res.status(500).send({message: 'Spiel nicht gefunden!'});
      }

      // As we use the gamecache, we have to check the user manually
      if (gp.internal.owner !== req.session.passport.user) {
        // Check if declared as additional admin
        if (gp.admins && gp.admins.logins && !_.find(gp.admins.logins, function (n) {
          return n === req.session.passport.user;
        })) {
          return res.status(403).send({message: 'Keine Berechtigung für dieses Spiel vorhanden.'});
        }
      }

      pricelist.getPricelist(gameId, function (err2, pl) {
        if (!pl) {
          pl = {};
        }

        authTokenManager.getNewToken(req.session.passport.user, function (err, token) {
            if (err) {
              return res.status(500).send({message: 'Interner Fehler beim Erstellen des Tokens.'});
            }
            req.session.ferropolyToken = token;
            res.send({
              authToken    : token,
              socketUrl    : 'http://' + settings.socketIoServer.host + ':' + settings.socketIoServer.port,
              gameplay     : gp,
              pricelist    : pl,
              teams        : _.values(teams),
              currentGameId: gameId,
              mapApiKey    : settings.maps.apiKey,
              user         : req.session.passport.user
            });
          }
        );
      });
    });
  });
});


/* GET the reception of all games */
router.get('/old/:gameId', function (req, res) {
  let gameId = req.params.gameId;

  gamecache.refreshCache(function (err) {
    if (err) {
      return errorHandler(res, 'Interner Fehler bei der Aktualisierung des Caches.', err, 404);
    }

    gamecache.getGameData(gameId, function (err, gamedata) {
      if (err) {
        return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
      }
      let gp    = gamedata.gameplay;
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
            title        : 'Ferropoly',
            minifiedjs   : settings.minifiedjs,
            ngFile       : '/js/infoctrl.js',
            hideLogout   : true,
            authToken    : token,
            user         : req.session.passport.user,
            err          : errMsg1,
            err2         : errMsg2,
            socketUrl    : 'http://' + settings.socketIoServer.host + ':' + settings.socketIoServer.port,
            gameplay     : JSON.stringify(gp),
            pricelist    : JSON.stringify(pl),
            teams        : JSON.stringify(_.values(teams)),
            currentGameId: gameId,
            mapApiKey    : settings.maps.apiKey
          });
        });
      });
    });
  });
});


module.exports = router;
