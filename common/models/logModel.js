/**
 * Model for the ferropoly log
 * Created by kc on 08.06.15.
 */
'use strict';
var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');

/**
 * The mongoose schema for a property
 */
var logSchema = mongoose.Schema({
  timestamp: {type: Date, default: Date.now},
  gameId: String,
  category: String,
  text: String
}, {autoIndex: false});

/**
 * The Log model
 */
var Log = mongoose.model('Log', logSchema);

/**
 * Creates a new log entry and saves it
 * @param gameId
 * @param category
 * @param text
 * @param callback
 * @returns {*}
 */
var addEntry = function (gameId, category, text, callback) {
  if (!gameId || !category || !text) {
    return callback(new Error('all params in createEntry must be set'));
  }
  var logEntry = new Log();
  logEntry.gameId = gameId;
  logEntry.category = category;
  logEntry.text = text;
  logEntry.save(callback);
};

/**
 * Deletes all entries for a gameplay
 * @param gameId
 * @param callback
 */
var deleteAllEntries = function (gameId, callback) {
  console.log('Removing all entries in the log');
  Log.find({gameId: gameId}).remove().exec(callback);
};

/**
 * Get all log entries for a gameplay
 * @param gameId
 * @param callback
 * @returns {*}
 */
var getLogEntries = function (gameId, tsStart, tsEnd, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (!tsStart) {
    tsStart = moment('2015-01-01');
  }
  if (!tsEnd) {
    tsEnd = moment();
  }
  return Team.find({gameId: gameId})
    .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
    .sort('timestamp')
    .lean()
    .exec(callback);
};

/**
 * Just a convenicence function
 * @param gameId
 * @param callback
 */
var getAllLogEntries = function (gameId, callback) {
  getLogEntries(gameId, undefined, undefined, callback);
};

module.exports = {
  Model: Log,
  addEntry: addEntry,
  deleteAllEntries: deleteAllEntries,
  getLogEntries: getLogEntries,
  getAllLogEntries: getAllLogEntries
};
