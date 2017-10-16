/**
 * Debug route: add a log entry for debugging purposes (Integration Tests)
 * Created by kc on 22.07.15.
 */

const express = require('express');
const router  = express.Router();
const logger  = require('../lib/logger').getLogger('debug');
const _       = require('lodash');

let debugNb = 0;

module.exports = function (options) {
  router.post('/', function (req, res) {
    let key = _.get(req, 'body.key');
    if (!options || !options.key) {
      return res.status(403).send({});
    }
    if (key !== options.key) {
      return res.status(401).send({});
    }
    let infoText = _.get(req, 'body.debug', 'Nothing to say...?');
    logger.info(debugNb);
    logger.info('##' + _.repeat('*', infoText.length - 2));
    logger.info(infoText);
    logger.info(' ');
    debugNb++;
    res.send({});
  });

  return router;
};
