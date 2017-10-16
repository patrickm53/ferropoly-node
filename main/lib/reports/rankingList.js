/**
 * Ranking list as downloadable file
 * Created by kc on 17.07.15.
 */

const teamAccount = require('../../lib/accounting/teamAccount');
const teamModel = require('../../../common/models/teamModel');
const moment = require('moment-timezone');
const xlsx = require('node-xlsx');

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
        let xlist = [['Rangliste']];
        for (let i = 0; i < ranking.length; i++) {
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
      let xbuffer = xlsx.build([{name: 'Rangliste', data: xlist}]);
      let prefix = moment.tz(moment(), 'Europe/Zurich').format('YYMMDD-HHmmss');
      callback(null, {
        data: xbuffer,
        name: prefix + '-' + gameId + '-rangliste.xlsx'
      });
    });
  }
};
