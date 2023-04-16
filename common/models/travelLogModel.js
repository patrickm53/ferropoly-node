/**
 * The travel log of a team
 * Created by kc on 11.06.15.
 */


const mongoose      = require('mongoose');
const logger        = require('../lib/logger').getLogger('travelLogModel');
const moment        = require('moment');
const _             = require('lodash');
/**
 * The mongoose schema for an user
 */
let travelLogSchema = mongoose.Schema({
  _id       : String,
  gameId    : String,
  teamId    : String,
  user      : String, // User who causes this entry
  propertyId: String, // EITHER propertyId
  position  : {       // OR location coordinates must be supplied
    lat     : Number,
    lng     : Number,
    accuracy: Number
  },
  timestamp : {type: Date, default: Date.now}
});


/**
 * The Travel-Log model
 */
let TravelLog = mongoose.model('TravelLog', travelLogSchema);

/**
 * Creates a new log entry and saves it
 * @param gameId
 * @param teamId
 * @param propertyId
 * @param callback
 * @returns {*}
 */
let addEntry = async function (gameId, teamId, propertyId, callback) {
  if (!gameId || !teamId || !propertyId) {
    return callback(new Error('all params in addEntry must be set'));
  }
  if (!_.isString(gameId) || !_.isString(teamId) || !_.isString(propertyId)) {
    return callback(new Error('all params in createEntry must be strings'));
  }
  let res, err;
  try {
    let logEntry        = new TravelLog();
    logEntry.gameId     = gameId;
    logEntry.teamId     = teamId;
    logEntry.propertyId = propertyId;
    logEntry._id        = gameId + '-' + moment().format('YYMMDD-hhmmss:SSS') + '-' + _.random(100000, 999999);
    res                 = await logEntry.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
};

/**
 * Adds an entry by its property
 * @param gameId
 * @param teamId
 * @param property
 * @param callback
 * @returns {*}
 */
async function addPropertyEntry(gameId, teamId, property, callback) {
  if (!gameId || !teamId || !property) {
    return callback(new Error('all params in addEntry must be set'));
  }
  if (!_.isString(gameId) || !_.isString(teamId)) {
    return callback(new Error('teamId and gameId params in createEntry must be strings'));
  }
  let err, res;
  try {
    let logEntry        = new TravelLog();
    logEntry.gameId     = gameId;
    logEntry.teamId     = teamId;
    logEntry.propertyId = property.uuid;
    logEntry.position   = {
      lat     : property.location.position.lat,
      lng     : property.location.position.lng,
      accuracy: 200
    };
    logEntry._id        = gameId + '-' + moment().format('YYMMDD-hhmmss:SSS') + '-' + _.random(100000, 999999);
    res                 = await logEntry.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}


/**
 * Adds an entry by its position
 * @param gameId
 * @param teamId
 * @param user
 * @param position
 * @param callback
 * @returns {*}
 */
async function addPositionEntry(gameId, teamId, user, position, callback) {
  if (!gameId || !teamId || !user || !position) {
    return callback(new Error('all params in addEntry must be set'));
  }
  if (!_.isString(gameId) || !_.isString(teamId)) {
    return callback(new Error('teamId and gameId params in createEntry must be strings'));
  }
  let err, res;
  try {
    let logEntry      = new TravelLog();
    logEntry.gameId   = gameId;
    logEntry.teamId   = teamId;
    logEntry.position = position;
    logEntry.user     = user;
    logEntry._id      = gameId + '-' + moment().format('YYMMDD-hhmmss:SSS') + '-' + _.random(100000, 999999);
    res               = await logEntry.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Deletes all entries for a gameplay
 * @param gameId
 * @param callback
 */
async function deleteAllEntries(gameId, callback) {
  logger.info('Removing all entries in the log');
  let err;
  try {
    await TravelLog.deleteMany({gameId: gameId});
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err);
  }
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
let getLogEntries = async function (gameId, teamId, tsStart, tsEnd, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (!tsStart) {
    tsStart = moment('2015-01-01');
  }
  if (!tsEnd) {
    tsEnd = moment();
  }
  let err, res;
  try {
    if (teamId) {
      res = await TravelLog
        .find({gameId: gameId})
        .where('teamId').equals(teamId)
        .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
        .sort('timestamp')
        .lean()
        .exec();
    } else {
      res = await TravelLog
        .find({gameId: gameId})
        .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
        .sort('timestamp')
        .lean()
        .exec();
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

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
  Model           : TravelLog,
  addEntry        : addEntry,
  deleteAllEntries: deleteAllEntries,
  getLogEntries   : getLogEntries,
  getAllLogEntries: getAllLogEntries,
  addPositionEntry: addPositionEntry,
  addPropertyEntry: addPropertyEntry
};
