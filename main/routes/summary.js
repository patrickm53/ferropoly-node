/**
 * The summary of a game, all data is collected here and uploaded to the page
 * Created by kc on 27.04.16.
 */


var express = require('express');
var router  = express.Router();

var gameplayModel               = require('../../common/models/gameplayModel');
var chancelleryTransactionModel = require('../../common/models/accounting/chancelleryTransaction');
var teamAccountTransactionModel = require('../../common/models/accounting/teamAccountTransaction');
var travelLogModel              = require('../../common/models/travelLogModel');
var propertyModel               = require('../../common/models/propertyModel');
var pricelist                   = require('../../common/lib/pricelist');
var teamModel                   = require('../../common/models/teamModel');
var errorHandler                = require('../lib/errorHandler');
var logger                      = require('../../common/lib/logger').getLogger('routes:summary');
var async                       = require('async');
var moment                      = require('moment');
var _                           = require('lodash');
/* GET home page. */
router.get('/:gameId', function (req, res) {
  var gameId = req.params.gameId;
  var info   = {};

  async.waterfall(
    [
      function (cb) {
        gameplayModel.getGameplay(gameId, null, cb);
      },
      function (gp, cb) {
        info.gameplay = gp;
        pricelist.getPricelist(gameId, cb);
      },
      function (pl, cb) {
        info.pricelist = pl;
        teamModel.getTeams(gameId, (err, foundTeams) => {
          if (err) {
            return cb(err);
          }
          info.teams = [];
          for (var i = 0; i < foundTeams.length; i++) {
            info.teams.push({
              name          : foundTeams[i].data.name,
              organization  : foundTeams[i].data.organization,
              teamLeaderName: foundTeams[i].data.teamLeader.name,
              teamId        : foundTeams[i].uuid
            });
          }
          cb(null);
        });
      },
      function (cb) {
        chancelleryTransactionModel.getEntries(gameId, null, null, cb);
      },
      function (chancellery, cb) {
        info.chancellery = chancellery;
        teamAccountTransactionModel.getEntries(gameId, null, null, null, cb);
      },
      function (teamTransactions, cb) {
        info.teamTransactions = teamTransactions;
        travelLogModel.getLogEntries(gameId, null, null, null, cb);
      },
      function (log, cb) {
        info.travelLog = log;
        teamAccountTransactionModel.getRankingList(gameId, cb);
      },
      function (rankingList, cb) {
        info.rankingList = rankingList;
        propertyModel.getPropertiesForGameplay(gameId, {lean: true}, cb);
      },
      function (properties, cb) {
        info.properties = properties;
        cb();
      }
    ],
    function (err) {
      if (err) {
        logger.error(err);
        info = {error: err.message};
      }
      else if (moment(_.get(info, 'gameplay.scheduling.gameDate')).isSame(new Date(), 'day')) {
        info = {error: 'Die Spieldaten stehen ab Mitternacht zur Verfügung!'};
      }
      res.render('summary/summary', {
        title     : 'Ferropoly',
        ngFile    : '/js/summaryctrl.js',
        hideLogout: true,
        info      : JSON.stringify(info)
      });
    }
  );

});

module.exports = router;
