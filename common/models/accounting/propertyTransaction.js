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
 */
async function book(transaction,) {
  return await transaction.save();
}


/**
 * Dumps all data for a gameplay (when deleting the game data)
 * @param gameId
 * @param callback
 */
async function dumpAccounts(gameId, callback) {
  logger.info('Removing all account information for ' + gameId);
  return await PropertyAccountTransaction
    .deleteMany({gameId: gameId})
    .exec();
}


/***
 * Get the entries of the account
 * @param gameId
 * @param propertyId
 * @param tsStart moment() to start, if undefined all
 * @param tsEnd   moment() to end, if undefined now()
 * @returns {*}
 */
async function getEntries(gameId, propertyId, tsStart, tsEnd) {

  if (!gameId || !propertyId) {
    throw new Error('parameter error');
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
  return data;
}

/**
 * Returns the sum of all account transactions sorted per property
 * @param gameId
 * @param propertyId optional
 * @param callback
 */
async function getSummary(gameId, propertyId) {

  if (_.isFunction(propertyId)) {
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

  return data;
}

module.exports = {
  Model       : PropertyAccountTransaction,
  dumpAccounts: dumpAccounts,
  book        : book,
  getEntries  : getEntries,
  getSummary  : getSummary
};
