/**
 * Checkin-Route for the teams
 * Created by kc on 08.01.16.
 */

var express          = require('express');
var router           = express.Router();
var _                = require('lodash');
var settings         = require('../settings');
var pricelist        = require('../../common/lib/pricelist');
var authTokenManager = require('../lib/authTokenManager');
var gamecache        = require('../lib/gameCache');
var errorHandler     = require('../lib/errorHandler');

/* GET the checkin of a game */
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
      var gp    = gamedata.gameplay;
      var teams = gamedata.teams;

      var team = _.find(_.values(teams), function (t) {
        if (t.data.teamLeader.email === req.session.passport.user) {
          return true;
        }
      });

      if (!gp || !gamedata) {
        return errorHandler(res, 'Spiel nicht gefunden.', new Error('gp or gamedata is undefined'), 500);
      }

      if (!gp.mobile.level) {
        return errorHandler(res, 'Dieses Spiel wurde für die Spieler nicht freigegeben.', new Error('Game is not for players'), 500);

      }

      pricelist.getPricelist(gameId, function (err2, pl) {
        if (err2) {
          return errorHandler(res, 'Die Preisliste konnte nicht geladen werden.', err2, 500);
        }

        if (!pl) {
          return errorHandler(res, 'Die Preisliste ist leer.', new Error('Empty pricelist'), 500);
        }

        authTokenManager.getNewToken(req.session.passport.user, function (err, token) {
          if (err) {
            return errorHandler(res, 'Interner Fehler beim Erstellen des Tokens.', err, 500);
          }
          req.session.ferropolyToken = token;

          res.render('checkin/checkin', {
            title        : 'Ferropoly',
            minifiedjs   : settings.minifiedjs,
            hideLogout   : true,
            authToken    : token,
            user         : req.session.passport.user,
            gameplay     : JSON.stringify(gp),
            pricelist    : JSON.stringify(pl),
            team         : JSON.stringify(team),
            currentGameId: gameId
          });
        });
      });
    });
  });

});


module.exports = router;

