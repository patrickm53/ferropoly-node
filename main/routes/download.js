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

  teamModel.getTeamsAsObject(req.params.gameId, function(err, teams) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }


    teamAccount.getRankingList(req.params.gameId, function(err, ranking) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      for (var i = 0; i < ranking.length; i++) {
        ranking[i].teamName = teams[ranking[i].teamId].data.name;
      }
      var csv = createCsv({'rank':'Rang', 'teamName':'Team', 'asset':'Vermögen'}, ranking);

      res.set({
        'Content-Type': 'application/csv; charset=utf-8',
        'Content-Description':'File Transfer',
        'Content-Disposition':'attachment; filename=Report.csv',
        'Content-Length': '123'
      });
      res.send(csv);
    });
  });

});

module.exports = router;
