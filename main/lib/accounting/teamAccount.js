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
  entry.transaction.origin = {type: 'bank'};
  entry.transaction.info = 'Startgeld';
  teamAccountTransaction.book(entry, function (err) {
    callback(err);
  });
}

/**
 * Charging a teams account to the bank
 * @param teamId
 * @param gameId
 * @param amount   amount to pay (will be always turned to a negative value)
 * @param info     optional text to be supplied with the transaction
 * @param callback
 */
function chargeToBank(teamId, gameId, amount, info, callback) {
  if (!teamId || !gameId || !_.isNumber(amount)) {
    callback(new Error('Parameter error in chargeToBank'));
    return;
  }
  // Amount has to be negative, not concerning of the parameter value!
  var chargedAmount = (-1) * Math.abs(amount);

  var entry = new teamAccountTransaction.Model();
  entry.gameId = gameId;
  entry.teamId = teamId;
  entry.transaction.amount = chargedAmount;
  entry.transaction.origin = {type: 'bank'};
  entry.transaction.info = info;
  teamAccountTransaction.book(entry, function (err) {
    callback(err);
  });
}

function chargeToAnotherTeam(gameId, payingTeamId, receivingTeamId, amount, info, callback) {
  if (!payingTeamId || !receivingTeamId || !info || !gameId || !_.isNumber(amount)) {
    callback(new Error('Parameter error in chargeToAnotherTeam'));
    return;
  }

  // Amount has to be positive for us, not concerning of the parameter value!
  var chargedAmount = Math.abs(amount);

  var chargingEntry = new teamAccountTransaction.Model();
  chargingEntry.gameId = gameId;
  chargingEntry.teamId = payingTeamId;
  chargingEntry.transaction.amount = chargedAmount * (-1);
  chargingEntry.transaction.origin = {
    uuid: receivingTeamId,
    type: 'team'
  };
  chargingEntry.transaction.info = info;

  var receivingEntry = new teamAccountTransaction.Model();
  receivingEntry.gameId = gameId;
  receivingEntry.teamId = receivingTeamId;
  receivingEntry.transaction.amount = chargedAmount;
  receivingEntry.transaction.origin = {
    uuid: payingTeamId,
    type: 'team'
  };
  receivingEntry.transaction.info = info;

  teamAccountTransaction.bookTransfer(chargingEntry, receivingEntry, function (err) {
    callback(err);
  });

}

module.exports = {
  payInterest: payInterest,
  chargeToBank: chargeToBank

};
