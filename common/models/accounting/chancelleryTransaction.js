/**
 * The chancellery transactions
 *
 * Created by kc on 20.04.15.
 */

const mongoose = require('mongoose');
const moment   = require('moment');
const logger   = require('../../lib/logger').getLogger('chancelleryTransaction');
const isArray  = require('lodash/isArray');

/**
 * The mongoose schema for a team account
 */
const chancelleryAccountTransactionSchema = mongoose.Schema({
  gameId   : String, // Game the transaction belongs to
  timestamp: {type: Date, default: Date.now}, // Timestamp of the transaction
  // teamId: String, // This is the uuid of the team the account belongs to

  transaction: {
    origin: {
      uuid: {type: String, default: 'none'} // uuid of the origin, this is always the uuid of a  team
    },
    amount: {type: Number, default: 0}, // value to be transferred, positive or negative
    info  : String  // Info about the transaction
  }
}, {autoIndex: true});

/**
 * The Gameplay model
 */
const ChancelleryTransaction = mongoose.model('ChancelleryTransactions', chancelleryAccountTransactionSchema);

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
async function dumpChancelleryData(gameId, callback) {
  let result;
  let err;
  try {
    if (!gameId) {
      return callback(new Error('No gameId supplied'));
    }
    logger.info('Removing all chancellery information for ' + gameId);
    result = await ChancelleryTransaction
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
 * @param tsStart moment() to start, if undefined all
 * @param tsEnd   moment() to end, if undefined now()
 * @param callback
 * @returns {*}
 */
async function getEntries(gameId, tsStart, tsEnd, callback) {
  let result;
  let err;
  try {
    if (!gameId) {
      return callback(new Error('parameter error'));
    }
    if (!tsStart) {
      tsStart = moment('2015-01-01');
    }
    if (!tsEnd) {
      tsEnd = moment();
    }
    result = await ChancelleryTransaction
      .find({gameId: gameId})
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, result);
  }
}

/**
 * Get the balance, the current value of the chancellery
 * @param gameId
 * @param callback
 */
async function getBalance(gameId, callback) {
  let result;
  let err;
  try {
    result = await ChancelleryTransaction
      .aggregate([
        {
          $match: {
            gameId: gameId
          }
        }, {
          $group: {
            _id    : 'balance',
            balance: {$sum: "$transaction.amount"}
          }
        }
      ])
      .exec();
    if (result && isArray(result) && result.length > 0) {
      result = result[0];
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, result);
  }
}


module.exports = {
  Model              : ChancelleryTransaction,
  book               : book,
  getEntries         : getEntries,
  dumpChancelleryData: dumpChancelleryData,
  getBalance         : getBalance
};
