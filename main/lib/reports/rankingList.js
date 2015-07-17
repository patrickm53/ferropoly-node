/**
 * Ranking list as downloadable file
 * Created by kc on 17.07.15.
 */
'use strict';
var teamAccount = require('../../lib/accounting/teamAccount');
var teamModel = require('../../../common/models/teamModel');
var csvGenerator = require('./csvGenerator');
var moment = require('moment-timezone');

module.exports = {
  createCsv: function (gameId, callback) {
    teamModel.getTeamsAsObject(gameId, function (err, teams) {
      if (err) {
        return callback(err);
      }

      teamAccount.getRankingList(gameId, function (err, ranking) {
        if (err) {
          return callback(err);
        }
        for (var i = 0; i < ranking.length; i++) {
          ranking[i].teamName = teams[ranking[i].teamId].data.name;
        }
        var prefix = moment.tz(moment(), 'Europe/Zurich').format('YYMMDD-HHmmss');
        callback(null, {
          csv: csvGenerator.create({'rank': 'Rang', 'teamName': 'Team', 'asset': 'Vermögen'}, ranking),
          filename: prefix + '-rangliste.csv'
        });
      });
    });
  }
};
