/**
 * Ranking list as downloadable file
 * Created by kc on 17.07.15.
 */
'use strict';
var teamAccount = require('../../lib/accounting/teamAccount');
var teamModel = require('../../../common/models/teamModel');
var moment = require('moment-timezone');
var xlsx = require('node-xlsx');

module.exports = {
  /**
   * Returns the raw ranking list as array. The array is ready to be converted as a xlsx sheet
   * @param gameId
   * @param callback
   */
  get: function (gameId, callback) {
    teamModel.getTeamsAsObject(gameId, function (err, teams) {
      if (err) {
        return callback(err);
      }
      teamAccount.getRankingList(gameId, function (err, ranking) {
        if (err) {
          return callback(err);
        }
        var xlist = [['Rangliste']];
        for (var i = 0; i < ranking.length; i++) {
          xlist.push([i + 1, teams[ranking[i].teamId].data.name, ranking[i].asset]);
        }
        xlist.push(['Stand: ' + moment.tz(moment(), 'Europe/Zurich').format('D.M.YYYY HH:mm')]);
        callback(null, xlist);
      });
    });
  },
  /**
   * Create an Excel-File with the ranking list
   * @param gameId
   * @param callback
   */
  createXlsx: function (gameId, callback) {
    this.get(gameId, function (err, xlist) {
      if (err) {
        return callback(err);
      }
      var xbuffer = xlsx.build([{name: 'Rangliste', data: xlist}]);
      var prefix = moment.tz(moment(), 'Europe/Zurich').format('YYMMDD-HHmmss');
      callback(null, {
        data: xbuffer,
        name: prefix + '-' + gameId + '-rangliste.xlsx'
      });
    });
  }
};
