/**
 * Team Account reporting
 * Created by kc on 17.07.15.
 */
'use strict';
var teamAccount = require('../../lib/accounting/teamAccount');
var teamModel = require('../../../common/models/teamModel');
var csvGenerator = require('./csvGenerator');
var moment = require('moment-timezone');
var _ = require('lodash');

module.exports = {
  createCsv: function (gameId, teamId, callback) {
    var retVal = {};

    teamModel.getTeamsAsObject(gameId, function (err, teams) {
      if (err) {
        return callback(err);
      }
      teamAccount.getAccountStatement(gameId, teamId, function (err, data) {
        if (err) {
          return callback(err);
        }

        var prefix = moment.tz(moment(), 'Europe/Zurich').format('YYMMDD-HHmmss');
        if (teamId) {
          if (!teams[teamId]) {
            return callback(new Error('Unkown teamId'));
          }
          retVal.filename = prefix + '-kontobuch-' + _.kebabCase(_.escape(teams[teamId].data.name)) + '.csv';
        }
        else {
          retVal.filename = prefix + '-kontobuch-alle.csv';
        }

        // Format all data
        for (var i = 0; i < data.length; i++) {
          data[i].teamName = teams[data[i].teamId].data.name;
          data[i].time = moment(data[i].timestamp).format('HH:mm:ss');
          data[i].info = data[i].transaction.info;
          data[i].category = _.startCase(data[i].transaction.origin.category);
          data[i].amount = data[i].transaction.amount;
          data[i].partsText = '';
          if (!teams[data[i].teamId].balance) {
            teams[data[i].teamId].balance = 0;
          }
          teams[data[i].teamId].balance += data[i].transaction.amount;
          data[i].balance = teams[data[i].teamId].balance;
          for (var t = 0; t < data[i].transaction.parts.length; t++) {
            data[i].partsText += data[i].transaction.parts[t].propertyName + ':' + data[i].transaction.parts[t].amount + ' ';
          }
          data[i] = _.omit(data[i], 'transaction');
        }
        retVal.csv = csvGenerator.create({
          'time': 'Zeit',
          'teamName': 'Team',
          'info': 'Buchungstext',
          'partsText': 'Teilbuchungen',
          'category': 'Kategorie',
          'amount': 'Betrag',
          'balance': 'Saldo'
        }, data);
        callback(null, retVal);
      });
    })
  }
};
