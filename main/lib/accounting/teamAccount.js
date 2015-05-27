/**
 * This is the account of a TEAM: every transaction, positive or negative, is done
 * over this module.
 * Created by kc on 19.04.15.
 */
'use strict';
var _ = require('lodash');
var teamAccountTransaction = require('./../../../common/models/accounting/teamAccountTransaction');
var moment = require('moment');
var ferroSocket;
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
    if (ferroSocket) {
      ferroSocket.emitToClients(gameId, 'teamAccount', {cmd: 'onTransaction', data: entry});
    }
  });
}

/**
 * Internal function, charging to bank or chancellery
 * @param teamId
 * @param gameId
 * @param amount
 * @param info
 * @param category
 * @param callback
 * @returns {*}
 */
function chargeToBankOrChancellery(teamId, gameId, amount, info, category, callback) {
  if (!teamId || !gameId || !_.isNumber(amount)) {
    callback(new Error('Parameter error in chargeToBank'));
    return;
  }

  if (amount === 0) {
    return callback(new Error('Value must not be 0'));
  }

  // Amount has to be negative, not concerning of the parameter value!
  var chargedAmount = (-1) * Math.abs(amount);

  var entry = new teamAccountTransaction.Model();
  entry.gameId = gameId;
  entry.teamId = teamId;
  entry.transaction.amount = chargedAmount;
  entry.transaction.origin = {category: category};
  if (_.isString(info)) {
    entry.transaction.info = info;
  }
  else if (_.isObject(info)) {
    entry.transaction.info = info.info;
    entry.transaction.parts = info.parts;
  }

  teamAccountTransaction.book(entry, function (err) {
    if (ferroSocket) {
      ferroSocket.emitToClients(gameId, 'teamAccount', {cmd: 'onTransaction', data: entry});
    }
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
  chargeToBankOrChancellery(teamId, gameId, amount, info, 'bank', function (err) {
    callback(err);
  });
}

/**
 * Charging a teams account to the chancellery
 * @param teamId
 * @param gameId
 * @param amount   amount to pay (will be always turned to a negative value)
 * @param info     optional text to be supplied with the transaction or object
 * @param callback
 */
function chargeToChancellery(teamId, gameId, amount, info, callback) {
  chargeToBankOrChancellery(teamId, gameId, amount, info, 'chancellery', function (err) {
    callback(err);
  });
}

/**
 * Internal function for receiving money from bank or chancellery
 * @param teamId
 * @param gameId
 * @param amount
 * @param info
 * @param category
 * @param callback
 * @returns {*}
 */
function receiveFromBankOrChancellery(teamId, gameId, amount, info, category, callback) {
  try {
    if (!teamId || !gameId || !_.isNumber(amount)) {
      callback(new Error('Parameter error in chargeToBank'));
      return;
    }

    if (amount === 0) {
      return callback(new Error('Value must not be 0'));
    }

    var entry = new teamAccountTransaction.Model();
    entry.gameId = gameId;
    entry.teamId = teamId;
    entry.transaction.amount = Math.abs(amount);
    entry.transaction.origin = {category: category};
    if (_.isString(info)) {
      entry.transaction.info = info;
    }
    else if (_.isObject(info)) {
      entry.transaction.info = info.info;
      entry.transaction.parts = info.parts;
    }

    teamAccountTransaction.book(entry, function (err) {
      if (ferroSocket) {
        ferroSocket.emitToClients(gameId, 'teamAccount', {cmd: 'onTransaction', data: entry});
      }
      callback(err);
    });
  }
  catch (e) {
    console.error(e);
    callback(e);
  }
}

/**
 * Get money for a teams account from the bank
 * @param teamId
 * @param gameId
 * @param amount   amount to pay (will be always turned to a positive value)
 * @param info     optional text to be supplied with the transaction or object
 * @param callback
 */
function receiveFromBank(teamId, gameId, amount, info, callback) {
  receiveFromBankOrChancellery(teamId, gameId, amount, info, 'bank', function (err) {
    callback(err);
  })
}

/**
 * Get money for a teams account from the chancellery
 * @param teamId
 * @param gameId
 * @param amount   amount to pay (will be always turned to a positive value)
 * @param info     optional text to be supplied with the transaction or object
 * @param callback
 */
function receiveFromChancellery(teamId, gameId, amount, info, callback) {
  receiveFromBankOrChancellery(teamId, gameId, amount, info, 'chancellery', function (err) {
    callback(err);
  })
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
  if (!debitorTeamId || !creditorTeamId || !info || !gameId || !_.isNumber(amount)) {
    callback(new Error('Parameter error in chargeToAnotherTeam'));
    return;
  }

  if (amount === 0) {
    return callback(new Error('Value must not be 0'));
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
  receivingEntry.transaction.origin = {uuid: debitorTeamId, category: 'team'};
  receivingEntry.transaction.info = info;

  teamAccountTransaction.bookTransfer(chargingEntry, receivingEntry, function (err) {
    if (err) {
      return callback(err);
    }
    if (ferroSocket) {
      ferroSocket.emitToClients(gameId, 'teamAccount', {cmd: 'onTransaction', data: chargingEntry});
      ferroSocket.emitToClients(gameId, 'teamAccount', {cmd: 'onTransaction', data: receivingEntry});
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

  teamAccountTransaction.getEntries(gameId, teamId, undefined, ts, function (err, data) {
    if (err) {
      return callback(err);
    }
    var saldo = 0;
    for (var i = 0; i < data.length; i++) {
      saldo += data[i].transaction.amount;
    }
    callback(err, {balance: saldo, entries: i});
  })
}

/**
 * Returns the ranking list for a gameplay
 * @param gameId
 * @param callback
 */
function getRankingList(gameId, callback) {
  // Get all entries, could be better done but I don't know how
  teamAccountTransaction.getEntries(gameId, undefined, undefined, undefined, function (err, data) {
    if (err) {
      return callback(err);
    }
    var retVal = {};
    for (var i = 0; i < data.length; i++) {
      if (!retVal[data[i].teamId]) {
        retVal[data[i].teamId] = {
          teamId: data[i].teamId,
          asset: 0
        };
      }
      retVal[data[i].teamId].asset += data[i].transaction.amount;
    }
    // Convert to array, sort and add rank
    var sorted = _.sortBy(_.values(retVal), function (n) {
      return n.asset * (-1);
    });
    for (i = 0; i < sorted.length; i++){
      sorted[i].rank = i + 1;
    }
    callback(null, sorted);
  });
}

/**
 * Gets the account statement, all bookings up to a given time
 *
 * Param order p-params: [start] [end] callback
 * If only one param (start|end) is supplied, it is handled as start
 *
 * @param gameId
 * @param teamId
 * @param p1
 * @param p2
 * @param p3
 */
function getAccountStatement(gameId, teamId, p1, p2, p3) {
  var tsStart = p1;
  var tsEnd = p2;
  var callback = p3;
  if (_.isFunction(p1)) {
    callback = p1;
    tsStart = undefined;
    tsEnd = moment();
  }
  else if (_.isFunction(p2)) {
    callback = p2;
    tsStart = p2;
    tsEnd = moment();
  }
  if (!tsEnd) {
    tsEnd = moment();
  }

  teamAccountTransaction.getEntries(gameId, teamId, tsStart, tsEnd, function (err, data) {
    callback(err, data);
  })
}

module.exports = {
  payInterest: payInterest,
  chargeToBank: chargeToBank,
  chargeToChancellery: chargeToChancellery,
  receiveFromBank: receiveFromBank,
  receiveFromChancellery: receiveFromChancellery,
  chargeToAnotherTeam: chargeToAnotherTeam,
  getBalance: getBalance,
  getAccountStatement: getAccountStatement,
  getRankingList: getRankingList,

  init: function () {
    ferroSocket = require('../ferroSocket').get();
  }
};
