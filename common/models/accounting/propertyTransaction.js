/**
 * A transaction related to a property
 *
 * Created by kc on 20.04.15.
 */
'use strict';

var mongoose = require('mongoose');
var moment = require('moment');
var logger = require('../../lib/logger').getLogger('propertyTransaction');

/**
 * The mongoose schema for a team account
 */
var propertyAccountTransactionSchema = mongoose.Schema({
  gameId: String, // Game the transaction belongs to
  timestamp: {type: Date, default: Date.now}, // Timestamp of the transaction
  propertyId: String, // This is the uuid of the property the account belongs to

  transaction: {
    origin: {
      uuid: {type: String, default: 'none'}, // uuid of the origin
      category: {type: String, default: 'not defined'}  // either "team" or "bank"
    },
    amount: {type: Number, default: 0}, // value to be transferred, positive or negative
    info: String  // Info about the transaction
  }
}, {autoIndex: true});

/**
 * The Gameplay model
 */
var PropertyAccountTransaction = mongoose.model('PropertyTransactions', propertyAccountTransactionSchema);

/**
 * Book the transaction
 * @param transaction
 * @param callback
 */
function book(transaction, callback) {
  transaction.transaction.amount = Math.floor(transaction.transaction.amount);
  transaction.save(function (err) {
    callback(err);
  });
}


/**
 * Dumps all data for a gameplay (when deleting the game data)
 * @param gameId
 * @param callback
 */
function dumpAccounts(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all account information for ' + gameId);
  PropertyAccountTransaction.remove({gameId: gameId}, function (err) {
    callback(err);
  })
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
function getEntries(gameId, propertyId, tsStart, tsEnd, callback) {
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
    PropertyAccountTransaction.find({gameId: gameId})
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec(function (err, data) {
        callback(err, data);
      });
  }
  else {
    // get only of the provided property
    PropertyAccountTransaction.find({gameId: gameId})
      .where('propertyId').equals(propertyId)
      .where('timestamp').gte(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec(function (err, data) {
        callback(err, data);
      });
  }

}

module.exports = {
  Model: PropertyAccountTransaction,
  dumpAccounts: dumpAccounts,
  book: book,
  getEntries: getEntries
};
