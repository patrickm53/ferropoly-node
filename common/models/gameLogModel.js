/**
 * This is the model for the log of a game: what happened when, who did what
 * The contents are displayed in the summary of the game.
 *
 * What shall be logged (not including all, just ideas for module design):
 * - Start of the game                             CAT_GENERAL
 * - a property is being sold (or one tries to)    CAT_PROPERTY
 * - Chancellery: "Parkplatz" being paid           CAT_CHANCELLERY
 * - End of the game                               CAT_GENERAL
 * Created by kc on 16.04.2020
 */

const mongoose = require('mongoose');
const logger   = require('../lib/logger').getLogger('gameLogModel');
const moment   = require('moment');
const _        = require('lodash');

/**
 * Categories
 */
const CAT_GENERAL     = 0; // General info: game started, ended
const CAT_PROPERTY    = 1; // a property was sold or was trying to be bought
const CAT_CHANCELLERY = 2; // chancellery actions
/**
 * The mongoose schema for a log entry
 */
let gameLogSchema     = mongoose.Schema({
  _id      : String,
  gameId   : String,
  teamId   : String, // Set only if relevant, otherwise undefined
  title    : String, // Title of the entry, as short and informative as possible
  message  : String, // This is the more detailed message (if any)
  category : {type: Number, default: CAT_GENERAL},
  files    : {type: Array, default: []}, // this is an array with objects for pics
  timestamp: {type: Date, default: Date.now}
});


/**
 * The Game-Log model
 */
let GameLog = mongoose.model('GameLog', gameLogSchema);


/**
 * Creates a new log entry and saves it
 * @param gameId
 * @param title
 * @param category
 * @param options
 * @param callback
 * @returns {*}
 */
let addEntry = function (gameId, category, title, options, callback) {
  if (!gameId || !title) {
    return callback(new Error('all params in addEntry must be set'));
  }
  if (!_.isString(gameId) || !_.isString(title)) {
    return callback(new Error('all params in createEntry must be strings'));
  }
  let logEntry      = new GameLog();
  logEntry.gameId   = gameId;
  logEntry.title    = title;
  logEntry.message  = _.get(options, 'message', '');
  logEntry.category = category
  logEntry.teamId   = _.get(options, 'teamId', undefined);
  logEntry.files    = []; // Not used yet
  logEntry._id      = gameId + '-' + moment().format('YYMMDD-hhmmss:SSS') + '-' + _.random(100000, 999999);
  logEntry.save(callback);
};

/**
 * Deletes all entries for a gameplay
 * @param gameId
 * @param callback
 */
let deleteAllEntries = function (gameId, callback) {
  logger.info('Removing all entries in the game log');
  GameLog.deleteMany({gameId: gameId}, callback);
};


/**
 * Get all log entries for a gameplay
 * @param gameId
 * @param teamId
 * @param tsStart
 * @param tsEnd
 * @param callback
 * @returns {*}
 */
let getLogEntries = function (gameId, teamId, tsStart, tsEnd, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (!tsStart) {
    tsStart = moment('2015-01-01');
  }
  if (!tsEnd) {
    tsEnd = moment();
  }
  if (teamId) {
    GameLog.find({gameId: gameId})
      .where('teamId').equals(teamId)
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec(callback);
  } else {
    GameLog.find({gameId: gameId})
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec(callback);
  }
};

/**
 * Just a convenicence function
 * @param gameId
 * @param teamId
 * @param callback
 */
let getAllLogEntries = function (gameId, teamId, callback) {
  getLogEntries(gameId, teamId, undefined, undefined, callback);
};

module.exports = {
  Model           : GameLog,
  addEntry        : addEntry,
  deleteAllEntries: deleteAllEntries,
  getLogEntries   : getLogEntries,
  getAllLogEntries: getAllLogEntries,
  // Constants
  CAT_GENERAL     : CAT_GENERAL,
  CAT_CHANCELLERY : CAT_CHANCELLERY,
  CAT_PROPERTY    : CAT_PROPERTY
};
