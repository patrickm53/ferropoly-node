/**
 * Checkin-Route for the teams
 * Created by kc on 08.01.16.
 */

const express          = require('express');
const router           = express.Router();
const _                = require('lodash');
const settings         = require('../settings');
const pricelist        = require('../../common/lib/pricelist');
const authTokenManager = require('../../common/lib/authTokenManager');
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
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'checkin.html'));
  });
});


/* GET the checkin of a game */
router.get('/old/:gameId', function (req, res) {
  let gameId = req.params.gameId;
  const user = _.get(req.session, 'passport.user', 'nobody');
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

      let team = _.find(_.values(teams), function (t) {
        if (t.data.teamLeader.email === user) {
          return true;
        }
        return _.find(t.data.members, function (m) {
          return m === user;
        });
      });

      if (!team) {
        return errorHandler(res, 'Team nicht gefunden.', new Error('gp or gamedata is undefined'), 500);
      }

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

        authTokenManager.getNewToken({user: user, proposedToken: req.session.authToken}, function (err, token) {
          if (err) {
            return errorHandler(res, 'Interner Fehler beim Erstellen des Tokens.', err, 500);
          }
          req.session.authToken = token;

          res.render('checkin/checkin', {
            title        : 'Ferropoly',
            minifiedjs   : settings.minifiedjs,
            hideLogout   : true,
            authToken    : token,
            user         : user,
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

