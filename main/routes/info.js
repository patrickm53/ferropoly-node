/**
 * Page about game info, no login required
 *
 * Created by kc on 08.05.15.
 */

const express = require('express');
const router  = express.Router();

const gameplayModel     = require('../../common/models/gameplayModel');
const pricelist         = require('../../common/lib/pricelist');
const teamModel         = require('../../common/models/teamModel');
const errorHandler      = require('../lib/errorHandler');
const logger            = require('../../common/lib/logger').getLogger('routes:info');
const priceListDownload = require('../../common/routes/downloadPricelist');

/* GET home page. */
router.get('/:gameId', function (req, res) {
  var gameId = req.params.gameId;

  gameplayModel.getGameplay(gameId, null, function (err, gp) {
    if (err) {
      logger.error(err);
      return errorHandler(res, 'Interner Fehler', err, 500);
    }
    if (!gp) {
      return errorHandler(res, 'Interner Fehler: gp ist null.', new Error('gp is undefined'), 500);
    }

    pricelist.getPricelist(gameId, function (err2, pl) {
      if (err2) {
        logger.error(err2);
        return errorHandler(res, 'Interner Fehler', err2, 500);
      }
      if (!pl) {
        return errorHandler(res, 'Interner Fehler: pl ist null.', new Error('pl is undefined'), 500);
      }

      teamModel.getTeams(gameId, function (err3, foundTeams) {
        if (err3) {
          logger.error(err3);
          return errorHandler(res, 'Interner Fehler', err3, 500);
        }
        // Filter some info
        var teams = [];
        for (var i = 0; i < foundTeams.length; i++) {
          teams.push({
            name          : foundTeams[i].data.name,
            organization  : foundTeams[i].data.organization,
            teamLeaderName: foundTeams[i].data.teamLeader.name
          });
        }

        res.render('info/info', {
          title     : 'Ferropoly',
          ngFile    : '/js/infoctrl.js',
          hideLogout: true,
          gameId    : gameId,
          gameplay  : JSON.stringify(gp),
          pricelist : JSON.stringify(pl),
          teams     : JSON.stringify(teams)
        });
      });
    });
  });
});

router.get('/:gameId/download', priceListDownload.handler);

module.exports = router;
