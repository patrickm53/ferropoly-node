/**
 * Team Account reporting
 * Created by kc on 17.07.15.
 */

const teamAccount = require('../../lib/accounting/teamAccount');
const teamModel = require('../../../common/models/teamModel');
const moment = require('moment-timezone');
const _ = require('lodash');
const xlsx = require('node-xlsx');
const async = require('async');

module.exports = {
  /**
   * Returns the team account repport for a given team (or for all teams, if teamId is not defined)
   * @param gameId
   * @param teamId
   * @param callback
   */
  get: function (gameId, teamId, teams, callback) {

    teamAccount.getAccountStatement(gameId, teamId, function (err, data) {
      if (err) {
        return callback(err);
      }

      var title = ' alle Teams';
      if (teamId) {
        if (!teams[teamId]) {
          return callback(new Error('Unknown teamId'));
        }
        title = ' ' + teams[teamId].data.name;
      }

      var xlist = [['Kontobuch' + title], ['Zeit', 'Team', 'Buchungstext', 'Betrag', 'Saldo', 'Transaktionen']];

      // Reset balance of all teams first
      _.forOwn(teams, (v, k) => {
        teams[k].balance = 0;
      });

      // Format all data
      for (var i = 0; i < data.length; i++) {
        var partText = '';
        if (data[i].transaction.parts) {
          data[i].transaction.parts.forEach(p => {
            partText += p.propertyName + ':' + p.amount + ' ';
          });
        }

        if (!teams[data[i].teamId].balance) {
          teams[data[i].teamId].balance = 0;
        }
        teams[data[i].teamId].balance += data[i].transaction.amount;

        var entry = [moment(data[i].timestamp).format('HH:mm:ss'),
          teams[data[i].teamId].data.name,
          data[i].transaction.info,
          data[i].transaction.amount,
          teams[data[i].teamId].balance,
          partText
        ];

        xlist.push(entry);
      }
      callback(null, xlist);
    });
  },

  /**
   * Creates an excel sheet with all teams
   * @param gameId
   * @param callback
   */
  createXlsx: function (gameId, callback) {
    var self = this;
    var prefix = moment.tz(moment(), 'Europe/Zurich').format('YYMMDD-HHmmss');
    teamModel.getTeamsAsObject(gameId, function (err, teams) {
      if (err) {
        return callback(err);
      }

      var teamArray = [undefined];
      _.forOwn(teams, function (value, key) {
        teamArray.push(key);
      });

      var sheets = [];
      async.eachSeries(
        teamArray,
        function (team, cb) {
          self.get(gameId, team, teams, function (err, xlist) {
            if (!team) {
              sheets.push({name: 'Alle Teams', data: xlist});
              return cb(err);
            }
            sheets.push({name: teams[team].data.name.substring(0,30), data: xlist});
            return cb(err);
          });
        },
        function (err) {
          // Finished all
          if (err) {
            return callback(err);
          }
          var xbuffer = xlsx.build(sheets);
          return callback(null, {data: xbuffer, name: prefix + '-kontobuch.xlsx'});
        });
    });
  }
};
