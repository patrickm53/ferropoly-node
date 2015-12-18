/**
 * Route for all files to download (respectively the files which are not downloadable from another place
 * due to logical reasons)
 *
 * Created by kc on 06.07.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var teamAccount = require('../lib/accounting/teamAccount');
var teamModel = require('../../common/models/teamModel');
var xlsx = require('node-xlsx');
var accessor = require('../lib/accessor');
var rankingList = require('../lib/reports/rankingList');
var teamAccountReport = require('../lib/reports/teamAccountReport');
/**
 * Get the ranking list
 */
router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    rankingList.createXlsx(req.params.gameId, function(err, report) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Description': 'File Transfer',
        'Content-Disposition': 'attachment; filename=' + report.name,
        'Content-Length': report.data.length
      });
      res.send(report.data);
    });
  });
});


/**
 * Returns the account info as CSV
 */
router.get('/teamAccount/:gameId/:teamId', function (req, res) {
  var filename;
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined') {
    req.params.teamId = undefined;
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    teamAccountReport.createCsv(req.params.gameId, req.params.teamId, function (err, report) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.set({
        'Content-Type': 'application/csv; charset=utf-8',
        'Content-Description': 'File Transfer',
        'Content-Disposition': 'attachment; filename=' + report.filename,
        'Content-Length': report.csv.length
      });
      res.send(report.csv);
    });
  });
});


module.exports = router;
