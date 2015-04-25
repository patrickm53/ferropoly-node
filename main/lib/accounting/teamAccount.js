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
 * @param info     optional text to be supplied with the transaction or object
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
  if (_.isString(info)) {
    entry.transaction.info = info;
  }
  else if(_.isObject(info)) {
    entry.transaction.info = info.info;
    entry.transaction.parts = info.parts;
  }

  teamAccountTransaction.book(entry, function (err) {
    callback(err);
  });
}
/**
 * One team pays another one
 * @param gameId
 * @param debitorTeamId
 * @param creditorTeamId
 * @param amount  amount to pay, always positive!
 * @param info
 * @param callback
 */
function chargeToAnotherTeam(gameId, debitorTeamId, creditorTeamId, amount, info, callback) {
  if (!debitorTeamId || !receivingTeamId || !info || !gameId || !_.isNumber(amount)) {
    callback(new Error('Parameter error in chargeToAnotherTeam'));
    return;
  }

  // Amount has to be positive for us, not concerning of the parameter value!
  var chargedAmount = Math.abs(amount);

  var chargingEntry = new teamAccountTransaction.Model();
  chargingEntry.gameId = gameId;
  chargingEntry.teamId = debitorTeamId;
  chargingEntry.transaction.amount = chargedAmount * (-1);
  chargingEntry.transaction.origin = {
    uuid: creditorTeamId,
    type: 'team'
  };
  chargingEntry.transaction.info = info;

  var receivingEntry = new teamAccountTransaction.Model();
  receivingEntry.gameId = gameId;
  receivingEntry.teamId = creditorTeamId;
  receivingEntry.transaction.amount = chargedAmount;
  receivingEntry.transaction.origin = {
    uuid: debitorTeamId,
    type: 'team'
  };
  receivingEntry.transaction.info = info;

  teamAccountTransaction.bookTransfer(chargingEntry, receivingEntry, function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, {amount: amount});
  });

}

module.exports = {
  payInterest: payInterest,
  chargeToBank: chargeToBank,
  chargeToAnotherTeam: chargeToAnotherTeam

};
