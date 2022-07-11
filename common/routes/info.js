/**
 * Info route
 * Created by kc on 22.07.15.
 */


const express = require('express');
const router  = express.Router();
const cors    = require('cors');
const package = require('../../package.json');
const moment  = require('moment');
const _       = require('lodash');

const initializationMoment = moment();
const versions             = process.versions;

const corsOptions = {
  origin              : 'https://ferropoly.ch',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

module.exports = function (settings, customData) {


  let handler = function (req, res) {

    // default handler
    let additionalHandler = function (callback) {
      callback();
    }
    if (_.isFunction(customData)) {
      additionalHandler = customData;
    }

    additionalHandler((err, data) => {
      if (err) {
        return res.status(500).send(`internal error: ${err.message}`);
      }
      let memUsage     = process.memoryUsage();
      memUsage.totalMb = Math.ceil((memUsage.rss + memUsage.heapTotal + memUsage.heapUsed) / 1024 / 1024);

      let uptime = moment.duration(process.uptime(), 'seconds');
      res.send({
        copyright  : 'Ferropoly ©2015 Christian Kuster, CH-8342 Wernetshausen, Sources provided under GPL licence, see www.ferropoly.ch for details.',
        app        : {
          name: package.name,
          title: package.title,
          version: package.version
        },
        settings: {
          serverId: settings.server.serverId,
          debugInstance: settings.debug,
          preview: settings.preview
        },
        memory     : memUsage,
        nodeVersion: versions,
        uptime     : {
          asSeconds: uptime.asSeconds(),
          asMinutes: uptime.asMinutes(),
          asHours  : uptime.asHours(),
          asDays   : uptime.asDays(),
          forHumans: uptime.humanize(),
          startTime: initializationMoment
        },
        aux        : data
      });
    })
  }

  router.get('/:apiKey', function (req, res) {
    if (req.params.apiKey !== _.get(settings, 'apiKey', 'none')) {
      return res.status(401).send('1 + 2 * 2 * 2 * 2 * 5 * 5');
    }
    handler(req, res);
  });
  router.get('/', cors(corsOptions), handler)
  return router;
}
