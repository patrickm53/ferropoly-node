/**
 * Ferropoly Logging Module
 *
 * Created by kc on 08.06.15.
 */

const winston = require('winston');
const moment = require('moment');
const util = require('util');
const _ = require('lodash');

let testCounter = 0;

let loggerSettings = {
  levels: {
    fatal: 4,
    error: 3,
    info: 2,
    warn: 1,
    debug: 0
  },
  colors: {
    fatal: 'blue',
    error: 'red',
    info: 'green',
    warn: 'yellow',
    debug: 'grey'
  }
};

const logger = new winston.Logger();
winston.setLevels(loggerSettings.levels);
winston.addColors(loggerSettings.colors);
logger.add(winston.transports.Console, {level: 'debug', colorize: true});

/**
 * Core logging function
 * @param module
 * @param level
 * @param message
 * @param metadata
 */
function log(module, level, message, metadata) {
  let info = moment().format() + ' ' + module + ': ';
  if (_.isObject(message)) {
    info += util.inspect(message);
  }
  else {
    info += message;
  }
  if (metadata) {
    info += '\n' + util.inspect(metadata);
  }
  logger.log(level, info);
}

module.exports = {
  add: function (transport, options) {
    logger.add(transport, options);
  },

  remove: function (transport) {
    logger.remove(transport);
  },

  getLogger: function (moduleName) {
    return {
      fatal: function (message, metadata) {
        log(moduleName, 'fatal', message, metadata);
      },
      error: function (message, metadata) {
        log(moduleName, 'error', message, metadata);
      },
      info: function (message, metadata) {
        log(moduleName, 'info', message, metadata);
      },
      warn: function (message, metadata) {
        log(moduleName, 'warn', message, metadata);
      },
      debug: function (message, metadata) {
        log(moduleName, 'info', message, metadata); // using info as otherwise on stderr
      },
      /**
       * Outputs data from a test (if any)
       * @param message
       * @param metadata
       */
      test: function(message, metadata) {
        if (!message) {
          return;
        }
        log(moduleName, 'info', testCounter + ' ##' + _.repeat('-', 80));
        log(moduleName, 'info', 'DEBUG: ' + message, metadata);
        testCounter++;
      }
    };
  }
};
