/**
 * Ferropoly Logging Module, requires Winston 3.x
 *
 * Created by kc on 08.06.15.
 */

const util                                = require('util');
const _                                   = require('lodash');
const {createLogger, format, transports}  = require('winston');
const {combine, timestamp, label, printf} = format;
const expressWinston                      = require('express-winston');

let settings = {
  debugLevel: 'info'
};

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
  init: function(options) {
    settings.debugLevel = _.get(options, 'debugLevel', settings.debugLevel);
  },

  /**
   * Sets the logger for express
   */
  setExpressLogger: function (app) {
    app.use(expressWinston.logger({
      transports   : [
        new transports.Console()
      ],
      format       : combine(
        label({label: 'HTTP'}),
        timestamp(),
        logFormat
      ),
      meta         : true, // optional: control whether you want to log the meta data about the request (default to true)
      msg          : "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize     : false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
  },

  /**
   * Gets a logger for a module
   * @param moduleName
   * @returns {{warn: warn, debug: debug, test: test, error: error, fatal: fatal, info: info}}
   */
  getLogger: function (moduleName) {
    const logger = createLogger({
      format    : combine(
        label({label: moduleName}),
        timestamp(),
        logFormat
      ),
      transports: [new transports.Console({level: settings.debugLevel})]
    });


    /**
     * Core logging function
     * @param module
     * @param level
     * @param message
     * @param metadata
     */
    function log(level, message, metadata) {
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
      test : function (message, metadata) {
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
