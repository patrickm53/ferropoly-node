/**
 * Access to the Ferropoly Database
 *
 *  !!!! THE SOURCE IS MAINTAINED IN THE FERROPOLY-EDITOR PROJECT !!!!
 * Created by kc on 02.01.15.
 */

var mongoose = require('mongoose');

var db = undefined;
var mongooseThis = undefined;

module.exports = {
  /**
   * Get the DB of the module
   * @returns {undefined}
   */
  getDb: function () {
    return db;
  },

  init: function (settings, callback) {
    console.log('Connecting to MongoDb');

    // Already initialized
    if (db) {
      callback(null, db);
    }

    // Connect to the MongoDb
    var options = {
      server: {
        socketOptions: {keepAlive: 1}
      },
      replset: {
        socketOptions: {keepAlive: 1}
      }
    };
    mongooseThis = mongoose.connect(settings.locationDbSettings.mongoDbUrl, options);
    db = mongoose.connection;

    db.on('error', function (err) {
      console.log('MongoDb Connection Error:');
      console.log(err);
      console.log('Killing myself, since I got a disconnect from the repo... (did you start mongodb?)');
      /*eslint no-process-exit:0*/
      process.exit(1);
    });


    db.once('open', function cb() {
      console.log('yay!');
      return callback(null, db);
    });
  },

  close: function (callback) {
    console.log('Disconnecting MongoDb');
    if (mongooseThis) {
      mongooseThis.disconnect(function (err) {
        db = undefined;
        callback(err);
      })
    }
  }
};
