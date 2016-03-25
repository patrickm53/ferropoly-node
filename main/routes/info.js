/**
 * Page about game info, no login required
 *
 * Created by kc on 08.05.15.
 */



var express = require('express');
var router = express.Router();

var gameplayModel = require('../../common/models/gameplayModel');
var pricelist = require('../../common/lib/pricelist');
var teamModel = require('../../common/models/teamModel');
var errorHandler = require('../lib/errorHandler');
var logger = require('../../common/lib/logger').getLogger('routes:info');
var priceListDownload = require('../../common/routes/downloadPricelist');

/* GET home page. */
router.get('/:gameId', function (req, res) {
  var gameId = req.params.gameId;

  gameplayModel.getGameplay(gameId, null, function (err, gp) {
    if (err) {
      logger.err(err);
      return errorHandler(res, 'Interner Fehler', err, 500);
    }
    if (!gp) {
      return errorHandler(res, 'Interner Fehler: gp ist null.', new Error('gp is undefined'), 500);
    }

    pricelist.getPricelist(gameId, function (err2, pl) {
      if (err2) {
        logger.err(err2);
        return errorHandler(res, 'Interner Fehler', err2, 500);
      }
      if (!pl) {
        return errorHandler(res, 'Interner Fehler: pl ist null.', new Error('pl is undefined'), 500);
      }

      teamModel.getTeams(gameId, function (err3, foundTeams) {
        if (err3) {
          logger.err(err3);
          return errorHandler(res, 'Interner Fehler', err3, 500);
        }
        // Filter some info
        var teams = [];
        for (var i = 0; i < foundTeams.length; i++) {
          teams.push({
            name: foundTeams[i].data.name,
            organization: foundTeams[i].data.organization,
            teamLeaderName: foundTeams[i].data.teamLeader.name
          });
        }

        res.render('info', {
          title: 'Ferropoly',
          ngFile: '/js/infoctrl.js',
          hideLogout: true,
          gameplay: JSON.stringify(gp),
          pricelist: JSON.stringify(pl),
          teams: JSON.stringify(teams)
        });
      });
    });
  });
});

router.get('/:gameId/download', priceListDownload.handler);

module.exports = router;
