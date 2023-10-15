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
const gameLogSchema   = mongoose.Schema({
  _id      : String,
  gameId   : String,
  teamId   : String, // Set only if relevant, otherwise undefined
  title    : String, // Title of the entry, as short and informative as possible
  saveTitle: String, // Title save to be displayed to users (nor revealing any positions)
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
 * @param p1 was gameId
 * @param p2 was category
 * @param p3 was title
 * @param p4 was options
 * @param p5 was callback
 * @returns {*}
 */
//let addEntry = function (gameId, category, title, options, callback) {
async function addEntry(p1, p2, p3, p4, p5) {
  let result;
  let err;
  let callback;
  try {
    let gameId    = p1;
    let category  = p2;
    let title     = p3;
    let saveTitle = ''; // title without additional infos about locations, "game save"
    let options   = p4;
    callback      = p5;

    if (_.isFunction(p2) && _.isObject((p1))) {
      // New API with object as param 1 and callback as param 2
      gameId    = _.get(p1, 'gameId', null);
      category  = _.get(p1, 'category', CAT_GENERAL);
      saveTitle = _.get(p1, 'saveTitle', '');
      title     = _.get(p1, 'title', saveTitle);
      options   = _.get(p1, 'options', {});
      callback  = p2;
    }

    if (!gameId) {
      err = new Error('gameId in addEntry must be set');
      return;
    }

    if (!_.isString(gameId) || !_.isString(title)) {
      err = new Error('all params in createEntry must be strings');
      return;
    }

    let logEntry       = new GameLog();
    logEntry.gameId    = gameId;
    logEntry.title     = title;
    logEntry.saveTitle = saveTitle;
    logEntry.message   = _.get(options, 'message', '');
    logEntry.category  = category
    logEntry.teamId    = _.get(options, 'teamId', undefined);
    logEntry.files     = []; // Not used yet
    logEntry._id       = gameId + '-' + moment().format('YYMMDD-hhmmss:SSS') + '-' + _.random(100000, 999999);
    result             = await logEntry.save();

  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, result);
  }
}

/**
 * Deletes all entries for a gameplay
 * @param gameId
 */
async function deleteAllEntries(gameId) {
  logger.info('Removing all entries in the game log');
  return await GameLog
    .deleteMany({gameId: gameId})
    .exec();
}


/**
 * Get all log entries for a gameplay
 * @param gameId
 * @param teamId
 * @param tsStart
 * @param tsEnd
 * @param callback
 * @returns {*}
 */
function getLogEntries(gameId, teamId, tsStart, tsEnd, callback) {

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
    GameLog
      .find({gameId: gameId})
      .where('teamId').equals(teamId)
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec()
      .then(res => {
        return callback(null, res);
      })
      .catch(err => {
        return callback(err);
      })
    return callback(null, res);
  } else {
    GameLog
      .find({gameId: gameId})
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec()
      .then(res => {
        return callback(null, res);
      })
      .catch(err => {
        return callback(err);
      })
  }
}


/**
 * Just a convenicence function
 * @param gameId
 * @param teamId
 * @param callback
 */
function getAllLogEntries(gameId, teamId, callback) {
  getLogEntries(gameId, teamId, undefined, undefined, callback);
}


module.exports = {
  Model           : GameLog,
  addEntry        : addEntry,
  deleteAllEntries: deleteAllEntries,
  getLogEntries   : getLogEntries,
  getAllLogEntries: getAllLogEntries,
  // Constants
  CAT_GENERAL    : CAT_GENERAL,
  CAT_CHANCELLERY: CAT_CHANCELLERY,
  CAT_PROPERTY   : CAT_PROPERTY
};
