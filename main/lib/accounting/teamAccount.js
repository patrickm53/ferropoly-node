/**
 * This is the account of a TEAM: every transaction, positive or negative, is done
 * over this module.
 * Created by kc on 19.04.15.
 */
'use strict';
var _ = require('lodash');
var teamAccountTransaction = require('./models/teamAccountTransaction');
var moment = require('moment');

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
  entry.transaction.origin = {category: 'bank'};
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
  entry.transaction.origin = { category: 'bank'};
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
    category: 'team'
  };
  chargingEntry.transaction.info = info;

  var receivingEntry = new teamAccountTransaction.Model();
  receivingEntry.gameId = gameId;
  receivingEntry.teamId = creditorTeamId;
  receivingEntry.transaction.amount = chargedAmount;
  receivingEntry.transaction.origin = {uuid : debitorTeamId, category:'team'};
  receivingEntry.transaction.info = info;

  teamAccountTransaction.bookTransfer(chargingEntry, receivingEntry, function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, {amount: amount});
  });
}

/**
 * Gets the balance, at a given time or now
 * @param gameId
 * @param teamId
 * @param p1 timestamp until when the balance shall be gotten (optional, default: now)
 * @param p2 callback
 */
function getBalance(gameId, teamId, p1, p2) {
  var callback = p2;
  var ts = p1;
  if (_.isFunction(p1)) {
    callback = p1;
    ts = moment();
  }

  teamAccountTransaction.getEntries(gameId, teamId, undefined, ts, function(err, data) {
    callback(err, data);
  })
}

module.exports = {
  payInterest: payInterest,
  chargeToBank: chargeToBank,
  chargeToAnotherTeam: chargeToAnotherTeam

};
