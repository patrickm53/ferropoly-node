/**
 * The summary of a game, all data is collected here and uploaded to the page
 * Created by kc on 27.04.16.
 */


const express = require('express');
const router  = express.Router();

const settings                  = require('../settings');
const gameplayModel               = require('../../common/models/gameplayModel');
const chancelleryTransactionModel = require('../../common/models/accounting/chancelleryTransaction');
const teamAccountTransactionModel = require('../../common/models/accounting/teamAccountTransaction');
const travelLogModel              = require('../../common/models/travelLogModel');
const propertyModel               = require('../../common/models/propertyModel');
const pricelist                   = require('../../common/lib/pricelist');
const teamModel                   = require('../../common/models/teamModel');
const errorHandler                = require('../lib/errorHandler');
const logger                      = require('../../common/lib/logger').getLogger('routes:summary');
const async                       = require('async');
const moment                      = require('moment');
const _                           = require('lodash');


var ngFile = '/js/summaryctrl.js';
if (settings.minifiedjs) {
  ngFile = '/js/min/summaryctrl.min.js';
}

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