/**
 * Route for all files to download
 *
 * Created by kc on 06.07.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var teamAccount = require('../lib/accounting/teamAccount');
var teamModel = require('../../common/models/teamModel');
var moment = require('moment');
/**
 * Creates a CSV
 * @param columns Object with the property names and their titles. Each property is one column
 * @param data Array with the data
 * @returns {Array} CSV styled data
 */
function createCsv(columns, data) {
  var i = 0;
  var retVal = '';
  var keys = _.keys(columns);
  var values = _.values(columns);

  var header = '';
  for (i = 0; i < values.length; i++) {
    header += values[i] + ';';
  }
  retVal += header + '\n';

  for (i = 0; i < data.length; i++) {
    var row = '';
    _.forEach(keys, function (key) {
      if (data[i] && data[i][key]) {
        row += data[i][key] + ';'
      }
      else {
        row += ';';
      }
    });
    retVal += row + '\n';
  }

  return retVal;
}

/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }

  teamModel.getTeamsAsObject(req.params.gameId, function (err, teams) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }

    teamAccount.getRankingList(req.params.gameId, function (err, ranking) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      for (var i = 0; i < ranking.length; i++) {
        ranking[i].teamName = teams[ranking[i].teamId].data.name;
      }
      var csv = createCsv({'rank': 'Rang', 'teamName': 'Team', 'asset': 'Vermögen'}, ranking);

      res.set({
        'Content-Type': 'application/csv; charset=utf-8',
        'Content-Description': 'File Transfer',
        'Content-Disposition': 'attachment; filename=rangliste.csv',
        'Content-Length': '123'
      });
      res.send(csv);
    });
  });
});

/**
 * Returns the account info as CSV
 */
router.get('/teamAccount/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined') {
    req.params.teamId = undefined;
  }
  teamModel.getTeamsAsObject(req.params.gameId, function (err, teams) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    teamAccount.getAccountStatement(req.params.gameId, req.params.teamId, function (err, data) {
      if (err) {
        return res.send({status: 'error', message: err.message});
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
      var csv = createCsv({
        'time': 'Zeit',
        'teamName': 'Team',
        'info': 'Buchungstext',
        'partsText': 'Teilbuchungen',
        'category': 'Kategorie',
        'amount': 'Betrag',
        'balance': 'Saldo'
      }, data);

      res.set({
        'Content-Type': 'application/csv; charset=utf-8',
        'Content-Description': 'File Transfer',
        'Content-Disposition': 'attachment; filename=rangliste.csv',
        'Content-Length': '123'
      });
      res.send(csv);
    });
  });

});

module.exports = router;
