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


/* GET static data of a game */
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

        authTokenManager.getNewToken({
            user         : req.session.passport.user,
            proposedToken: req.session.authToken
          }, function (err, token) {
            if (err) {
              return res.status(500).send({message: 'Interner Fehler beim Erstellen des Tokens.'});
            }
            req.session.authToken = token;
            res.send({
              authToken    : token,
              socketUrl    : '/',
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

module.exports = router;
