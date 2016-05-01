/**
 * Team Account reporting
 * Created by kc on 17.07.15.
 */

var teamAccount = require('../../lib/accounting/teamAccount');
var teamModel = require('../../../common/models/teamModel');
var moment = require('moment-timezone');
var _ = require('lodash');
var xlsx = require('node-xlsx');
var async = require('async');

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

      // Format all data
      for (var i = 0; i < data.length; i++) {
        var partText = '';
        for (var t = 0; t < data[i].transaction.parts.length; t++) {
          partText += data[i].transaction.parts[t].propertyName + ':' + data[i].transaction.parts[t].amount + ' ';
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
            sheets.push({name: teams[team].data.name, data: xlist});
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
