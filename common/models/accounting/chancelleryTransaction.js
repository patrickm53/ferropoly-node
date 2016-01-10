/**
 * The chancellery transactions
 *
 * Created by kc on 20.04.15.
 */
'use strict';

var mongoose = require('mongoose');
var moment   = require('moment');
var logger   = require('../../lib/logger').getLogger('chancelleryTransaction');

/**
 * The mongoose schema for a team account
 */
var chancelleryAccountTransactionSchema = mongoose.Schema({
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
var ChancelleryTransaction = mongoose.model('ChancelleryTransactions', chancelleryAccountTransactionSchema);

/**
 * Book the transaction
 * @param transaction
 * @param callback
 */
function book(transaction, callback) {
  transaction.save(function (err) {
    callback(err);
  });
}

/**
 * Dumps all data for a gameplay (when deleting the game data)
 * @param gameId
 * @param callback
 */
function dumpChancelleryData(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all chancellery information for ' + gameId);
  ChancelleryTransaction.remove({gameId: gameId}, function (err) {
    callback(err);
  })
}


/***
 * Get the entries of the account
 * @param gameId
 * @param tsStart moment() to start, if undefined all
 * @param tsEnd   moment() to end, if undefined now()
 * @param callback
 * @returns {*}
 */
function getEntries(gameId, tsStart, tsEnd, callback) {
  if (!gameId) {
    return callback(new Error('parameter error'));
  }
  if (!tsStart) {
    tsStart = moment('2015-01-01');
  }
  if (!tsEnd) {
    tsEnd = moment();
  }
  ChancelleryTransaction.find({gameId: gameId})
    .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
    .sort('timestamp')
    .lean()
    .exec(function (err, data) {
      callback(err, data);
    })
}

/**
 * Get the balance, the current value of the chancellery
 * @param gameId
 * @param callback
 */
function getBalance(gameId, callback) {

  ChancelleryTransaction.aggregate({
    $match: {
      gameId: gameId
    }
  }, {
    $group: {
      _id    : 'balance',
      balance: {$sum: "$transaction.amount"}
    }
  }, callback);
}


module.exports = {
  Model              : ChancelleryTransaction,
  book               : book,
  getEntries         : getEntries,
  dumpChancelleryData: dumpChancelleryData,
  getBalance         : getBalance
};
