/**
 * A transaction related to a property
 *
 * Created by kc on 20.04.15.
 */


const mongoose = require('mongoose');
const moment   = require('moment');
const logger   = require('../../lib/logger').getLogger('propertyTransaction');
const _        = require('lodash');

/**
 * The mongoose schema for a team account
 */
const propertyAccountTransactionSchema = mongoose.Schema({
  gameId    : String, // Game the transaction belongs to
  timestamp : {type: Date, default: Date.now}, // Timestamp of the transaction
  propertyId: String, // This is the uuid of the property the account belongs to

  transaction: {
    origin: {
      uuid    : {type: String, default: 'none'}, // uuid of the origin
      category: {type: String, default: 'not defined'}  // either "team" or "bank"
    },
    amount: {type: Number, default: 0}, // value to be transferred, positive or negative
    info  : String  // Info about the transaction
  }
}, {autoIndex: true});

/**
 * The Gameplay model
 */
const PropertyAccountTransaction = mongoose.model('PropertyTransactions', propertyAccountTransactionSchema);

/**
 * Book the transaction
 * @param transaction
 * @param callback
 */
async function book(transaction, callback) {
  let result;
  let err;
  try {
    result = await transaction.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, result);
  }
}


/**
 * Dumps all data for a gameplay (when deleting the game data)
 * @param gameId
 * @param callback
 */
async function dumpAccounts(gameId, callback) {
  let result;
  let err;
  try {
    if (!gameId) {
      return callback(new Error('No gameId supplied'));
    }
    logger.info('Removing all account information for ' + gameId);
    result = await PropertyAccountTransaction
      .deleteMany({gameId: gameId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, result);
  }
}


/***
 * Get the entries of the account
 * @param gameId
 * @param propertyId
 * @param tsStart moment() to start, if undefined all
 * @param tsEnd   moment() to end, if undefined now()
 * @param callback
 * @returns {*}
 */
async function getEntries(gameId, propertyId, tsStart, tsEnd, callback) {
  let data;
  let err;
  try {
    if (!gameId || !propertyId) {
      return callback(new Error('parameter error'));
    }

    if (!tsStart) {
      tsStart = moment('2015-01-01');
    }
    if (!tsEnd) {
      tsEnd = moment();
    }
    if (!propertyId) {
      // Get all
      data = await PropertyAccountTransaction
        .find({gameId: gameId})
        .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
        .sort('timestamp')
        .lean()
        .exec();
    } else {
      // get only of the provided property
      data = await PropertyAccountTransaction
        .find({gameId: gameId})
        .where('propertyId').equals(propertyId)
        .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
        .sort('timestamp')
        .lean()
        .exec();
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, data);
  }
}

/**
 * Returns the sum of all account transactions sorted per property
 * @param gameId
 * @param propertyId optional
 * @param callback
 */
async function getSummary(gameId, propertyId, callback) {
  let data;
  let err;
  try {
    if (_.isFunction(propertyId)) {
      callback   = propertyId;
      propertyId = undefined;
    }

    let match       = {};
    match['gameId'] = gameId;
    if (propertyId) {
      match['propertyId'] = propertyId;
    }

    data = await PropertyAccountTransaction
      .aggregate([{
        $match: match
      }, {
        $group: {
          _id    : '$propertyId',
          balance: {$sum: "$transaction.amount"}
        }
      }])
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, data);
  }
}

module.exports = {
  Model       : PropertyAccountTransaction,
  dumpAccounts: dumpAccounts,
  book        : book,
  getEntries  : getEntries,
  getSummary  : getSummary
};
