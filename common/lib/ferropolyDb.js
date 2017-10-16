/**
 * Access to the Ferropoly Database
 *
 *  !!!! THE SOURCE IS MAINTAINED IN THE FERROPOLY-EDITOR PROJECT !!!!
 * Created by kc on 02.01.15.
 */

const mongoose = require('mongoose');
const logger = require('./logger').getLogger('ferropolyDb');

let db = undefined;
let mongooseThis = undefined;

// Needed for the new mongoose, using the ES6 native promises
mongoose.Promise = global.Promise;

module.exports = {
  /**
   * Get the DB of the module
   * @returns {undefined}
   */
  getDb: function () {
    return db;
  },

  init: function (settings, callback) {
    let poolSize = settings.locationDbSettings.poolSize || 5;
    logger.info(`Connecting to MongoDb with a pool size of ${poolSize}`);

    // Already initialized
    if (db) {
      callback(null, db);
    }

    // Connect to the MongoDb
    let options = {
      useMongoClient: true,
      server: {
        socketOptions: {keepAlive: 1},
        poolSize: poolSize
      },
      replset: {
        socketOptions: {keepAlive: 1}
      }
    };
    mongooseThis = mongoose.connect(settings.locationDbSettings.mongoDbUrl, options);
    db = mongoose.connection;

    db.on('error', function (err) {
      logger.error('MongoDb Connection Error:', err);
      logger.info('Killing myself, since I got an error from the repo... (did you start mongodb?), starting kill timer...');
      /*eslint no-process-exit:0*/
      setTimeout(function () {
        logger.info('Killing instance now');
        process.exit(1);
      }, 2000);

    });

    db.on('disconnected', function (err) {
      logger.error('MongoDb Connection disconnected');
      if (!process.env.INTEGRATION_TEST) {
        logger.info('Killing myself, since I got a disconnect from the repo... (did you start mongodb?), starting kill timer...');
        /*eslint no-process-exit:0*/
        setTimeout(function () {
          logger.info('Killing instance now');
          process.exit(1);
        }, 2400);
      }
    });


    db.once('open', function cb() {
      logger.info('Connected to MongoDb');
      return callback(null, db);
    });
  },

  close: function (callback) {
    logger.info('Disconnecting MongoDb');
    if (mongooseThis) {
      mongooseThis.disconnect(function (err) {
        db = undefined;
        callback(err);
      })
    }
  }
};
