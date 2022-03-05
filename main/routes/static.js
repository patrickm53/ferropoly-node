/**
 * Static game data
 *
 * Replaces the formerly embedded data into pug files
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.03.22
 **/
const express          = require('express');
const router           = express.Router();
const gamecache        = require('../lib/gameCache');
const _                = require('lodash');
const pricelist        = require('../../common/lib/pricelist');
const authTokenManager = require('../lib/authTokenManager');
const settings         = require('../settings');


router.get('/:gameId', function (req, res) {
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
      // Only admins and owner get an access token (the right, to edit data)
      let generateToken = true;
      if (gp.internal.owner !== req.session.passport.user) {
        // Check if declared as additional admin
        if (gp.admins && gp.admins.logins && !_.find(gp.admins.logins, function (n) {
          return n === req.session.passport.user;
        })) {
          generateToken = false;
          //return res.status(403).send({message: 'Keine Berechtigung für dieses Spiel vorhanden.'});
        }
      }

      pricelist.getPricelist(gameId, function (err2, pl) {
        if (!pl) {
          pl = {};
        }

        authTokenManager.getNewToken({
            user         : req.session.passport.user,
            proposedToken: req.session.authToken,
            generateToken
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
