/**
 * The chancellery
 *
 * Created by kc on 20.04.15.
 */
'use strict';


var mongoose = require('mongoose');

/**
 * The mongoose schema for a team account
 */
var chancelleryAccountTransactionSchema = mongoose.Schema({
  gameId: String, // Game the transaction belongs to
  timestamp: {type: Date, default: Date.now}, // Timestamp of the transaction
 // teamId: String, // This is the uuid of the team the account belongs to

  transaction: {
    origin :{
      uuid: String // uuid of the origin, this is always the uuid of a  team
    },
    amount: {type: Number, default: 0}, // value to be transferred, positive or negative
    info: String  // Info about the transaction
  }
}, {autoIndex: true});

/**
 * The Gameplay model
 */
var ChancelleryAccountTransaction = mongoose.model('TeamAccountTransactions', chancelleryAccountTransactionSchema);

module.exports = {
  Model: ChancelleryAccountTransaction
};
