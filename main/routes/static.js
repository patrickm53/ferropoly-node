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
const authTokenManager = require('../../common/lib/authTokenManager');
const logger           = require('../../common/lib/logger').getLogger('static');
const settings         = require('../settings');


router.get('/:gameId', function (req, res) {
  let gameId = req.params.gameId;
  const user = _.get(req.session, 'passport.user', 'nobody');

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

      // The team is only returned if the requesting user is a player
      let team = _.find(_.values(teams), function (t) {
        if (t.data.teamLeader.email === user) {
          return true;
        }
        return _.find(t.data.members, function (m) {
          return m === user;
        });
      });

      pricelist.getPricelist(gameId, function (err2, pl) {
        if (!pl) {
          pl = {};
        }

        authTokenManager.getNewToken({
            user         : user,
            proposedToken: req.session.authToken
          }, function (err, token) {
            if (err) {
              return res.status(500).send({message: 'Interner Fehler beim Erstellen des Tokens.'});
            }
            req.session.authToken = token;
            req.session.save(err => {
              if (err) {
                logger.error(err);
              }
              res.send({
                authToken    : token,
                socketUrl    : '/',
                gameplay     : gp,
                pricelist    : pl,
                team         : team,
                teams        : _.values(teams),
                currentGameId: gameId,
                mapApiKey    : settings.maps.apiKey,
                user         : user
              });
            });
          }
        );
      });
    });
  });
});

module.exports = router;
