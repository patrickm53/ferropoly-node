/**
 * Info route
 * Created by kc on 22.07.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var session = require('express-session');
var uuid = require('node-uuid');
var logger = require('../lib/logger').getLogger('info');
var moment = require('moment');

var initializationMoment = moment();

/* GET the authtoken, which you only can get when logged in */
router.get('/', function (req, res) {
  var memUsage = process.memoryUsage();
  memUsage.totalMb = Math.ceil((memUsage.rss + memUsage.heapTotal + memUsage.heapUsed) / 1024 / 1024);

 var uptime = moment.duration(process.uptime(), 'seconds');
  res.send({
    copyright: 'Ferropoly ©2015 Christian Kuster, CH-8342 Wernetshausen, Sources provided under GPL licence, see www.ferropoly.ch for details.',
    memory: memUsage,
    nodeVersion: process.versions,
    uptime: {
      asSeconds: uptime.asSeconds(),
      asMinutes: uptime.asMinutes(),
      asHours: uptime.asHours(),
      asDays: uptime.asDays(),
      forHumans: uptime.humanize(),
      startTime: initializationMoment
    }
  });
});


module.exports = router;
