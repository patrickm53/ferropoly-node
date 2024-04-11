/**
 * Ferropoly Logging Module, requires Winston 3.x
 *
 * Created by kc on 08.06.15.
 */

const util                                         = require('util');
const _                                            = require('lodash');
const {createLogger, format, transports}           = require('winston');
const {combine, timestamp, label, printf}          = format;
const expressWinston                               = require('express-winston');
// Imports the Google Cloud client library for Winston
const {LoggingWinston}                             = require('@google-cloud/logging-winston');

// The default settings
let settings                                       = {
  debugLevel: 'info',
  google    : {
    enabled: false
  }
};

// Google Logging instance (if configured)
let googleLogger;

let testCounter = 0;

/**
 * Formatter for the logger
 * @type {never}
 */
const logFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

/**
 * Exports
 * @type {{add: module.exports.add, getLogger: (function(*=): {warn: warn, debug: debug, test: test, error: error, fatal: fatal, info: info}), remove: module.exports.remove, setExpressLogger: module.exports.setExpressLogger}}
 */
module.exports = {
  add: function (transport, options) {
    logger.add(transport, options);
  },

  remove: function (transport) {
    logger.remove(transport);
  },

  /**
   * First time initialisation for an instance
   * @param options
   */
  init: function (options) {
    settings.debugLevel = _.get(options, 'debugLevel', settings.debugLevel);
    _.set(settings, 'google.enabled', _.get(options, 'google.enabled', false));
    if (settings.google.enabled) {
      // Create google cloud logging
      _.set(settings, 'google.projectId', _.get(options, 'google.projectId', 'not-set'));
      _.set(settings, 'google.logName', _.get(options, 'google.logName', 'not-set'));
      _.set(settings, 'google.keyFile', _.get(options, 'google.keyFile', 'not-set'));
      googleLogger = new LoggingWinston({
        projectId: _.get(settings, 'google.projectId', 'not_set'),
        logName  : _.get(settings, 'google.logName', 'not_set'),
        keyFile  : _.get(settings, 'google.keyFile', 'not_set'),
        format   : format.json()
      });
      // Allocate enough listeners!
      googleLogger.setMaxListeners(100);
    }
  },

  /**
   * Sets the logger for express
   */
  setExpressLogger: function (app) {
    // The winston transport layers
    let supportedTransports = [
      new transports.Console()
    ];
    if (settings.google.enabled) {
      supportedTransports.push(googleLogger);
    }

    app.use(expressWinston.logger({
      transports   : supportedTransports,
      format       : combine(
        label({label: 'HTTP'}),
        timestamp(),
        logFormat
      ),
      meta         : true, // optional: control whether you want to log the meta data about the request (default to true)
      msg          : function (req, res) {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        return ` ${ip} ${_.get(req, 'user.personalData.email', 'anonymous')} ${req.method} ${res.statusCode}, ${req.url} ${res.responseTime} ms` // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      },
      expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize     : false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
  },

  /**
   * Gets a logger for a module
   * @param moduleName
   * @returns {{warn: warn, debug: debug, test: test, error: error, fatal: fatal, info: info}}
   */
  getLogger: function (moduleName) {
    // The winston transport layers
    let supportedTransports = [
      new transports.Console({
        format: combine(
          label({label: moduleName}),
          timestamp(),
          logFormat
        )
      })
    ];
    if (settings.google.enabled) {
      supportedTransports.push(googleLogger);
    }

    const logger = createLogger({
      transports: supportedTransports,
      format    : combine(
        label({label: moduleName}),
        timestamp(),
        logFormat)
    });


    /**
     * Core logging function
     * @param level
     * @param message
     * @param metadata
     */
    function log(level, message, metadata) {
      if (settings.google.enabled) {
        logger.log(level, message, {payload: metadata});
      } else {
        let info = '';
        if (_.isObject(message)) {
          info += util.inspect(message);
        } else {
          info += message;
        }
        if (metadata) {
          info += '\n' + util.inspect(metadata);
        }
        logger.log(level, info);
      }
    }

    return {
      fatal: function (message, metadata) {
        log('fatal', message, metadata);
      },
      error: function (message, metadata) {
        log('error', message, metadata);
      },
      info : function (message, metadata) {
        log('info', message, metadata);
      },
      warn : function (message, metadata) {
        log('warn', message, metadata);
      },
      debug: function (message, metadata) {
        log('debug', message, metadata); // using info as otherwise on stderr
      },
      /**
       * Outputs data from a test (if any)
       * @param message
       * @param metadata
       */
      test: function (message, metadata) {
        if (!message) {
          return;
        }
        logger.log('info', testCounter + ' ##' + _.repeat('-', 80));
        logger.log('info', 'DEBUG: ' + message, metadata);
        testCounter++;
      }
    };
  }
};
