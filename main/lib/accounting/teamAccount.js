/**
 * This is the account of a TEAM: every transaction, positive or negative, is done
 * over this module.
 * Created by kc on 19.04.15.
 */
'use strict';
var _ = require('lodash');
var teamAccountTransaction = require('./models/teamAccountTransaction');

/**
 * Pays the interest for one team
 * @param teamId
 * @param gameId
 * @param amount
 * @param callback
 */
function payInterest(teamId, gameId, amount, callback) {
  if (!teamId || !gameId || !_.isNumber(amount)) {
    callback(new Error('Parameter error in payInterest'));
    return;
  }
  var entry = new teamAccountTransaction.Model();
  entry.gameId = gameId;
  entry.teamId = teamId;
  entry.transaction.amount = amount;
  entry.transaction.origin.type = 'bank';
  entry.transaction.info = 'Startgeld';
  teamAccountTransaction.book(entry, function (err) {
    callback(err);
  });
}

module.exports = {
  payInterest: payInterest

};
