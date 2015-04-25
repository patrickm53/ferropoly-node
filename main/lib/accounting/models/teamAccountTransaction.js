/**
 * A transaction of a teams account
 *
 * Created by kc on 19.04.15.
 */
'use strict';

var mongoose = require('mongoose');

/**
 * The mongoose schema for a team account
 */
var teamAccountTransactionSchema = mongoose.Schema({
  gameId: String, // Game the transaction belongs to
  timestamp: {type: Date, default: Date.now}, // Timestamp of the transaction
  teamId: String, // This is the uuid of the team the account belongs to

  transaction: {
    /*
     The origin is the counterpart, not the one giving money. The flow of the money is defined
     by the amount, which is either positive or negative.
     */
    origin: {
      uuid: String, // uuid of the origin, can be a property or a team
      type: String  // either "team", "property", "bank", "chancellery"
    },
    amount: {type: Number, default: 0}, // value to be transferred, positive or negative
    info: String, // Info about the transaction
    /*
     If the transaction consists of several other transactions (interests every hour), we do not create
     a specific TeamAccountTransaction for every property. Instead there is an array having the same
     data as this transaction (except this array)
     */
    parts: Array
  }

}, {autoIndex: true});

/**
 * The Gameplay model
 */
var TeamAccountTransaction = mongoose.model('TeamAccountTransactions', teamAccountTransactionSchema);

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
 * Book two transactions: the debitor and creditor bookings
 * @param debitor
 * @param creditor
 * @param callback
 */
function bookTransfer(debitor, creditor, callback) {
  debitor.save(function (err) {
    if (err) {
      callback(err);
    }
    creditor.save(function (err) {
      callback(err);
    });
  });
}

module.exports = {
  Model: TeamAccountTransaction,
  book: book,
  bookTransfer: bookTransfer
};
