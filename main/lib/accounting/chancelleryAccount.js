/**
 * The account for the chancellery ("Chance / Kanzlei"): negative intersts are deposed
 * here, lucky winners get the pot then.
 *
 * The questions where teams can loose or earn money are not (??) part of this chancellery,
 * this goes to the bank. An alternative would be, that if a team looses money in this games,
 * the money comes into this pot. Todo: check the money flow for the questions
 * Created by kc on 20.04.15.
 */
'use strict';

var chancelleryTransaction = require('../../../common/models/accounting/chancelleryTransaction');
var teamAccount = require('./teamAccount');
var _ = require('lodash');
var moment = require('moment');
/**
 * Internal function: Books the chancellery event in the chancellery and the teams account
 * @param gameplay
 * @param team
 * @param info
 * @param callback
 */
function bookChancelleryEvent(gameplay, team, info, callback) {

  if (info.amount > 0) {
    // Positive amount: only bank is involved EXCEPT it is the jackpot
    if (info.jackpot) {
      return teamAccount.receiveFromChancellery(team.uuid, gameplay.internal.gameId, info.amount, info.infoText, function (err) {
        var entry = new chancelleryTransaction.Model();
        entry.gameId = gameplay.internal.gameId;
        entry.transaction = {
          origin: {
            uuid: team.uuid
          },
          amount: Math.abs(info.amount) * (-1),
          info: info.infoText
        };

        chancelleryTransaction.book(entry, function (err) {
          return callback(err);
        });

      })
    }
    else {
      return teamAccount.receiveFromBank(team.uuid, gameplay.internal.gameId, info.amount, info.infoText, function (err) {
        return callback(err);
      });
    }
  }
  else {
    // Negative amount: team is charged, amount goes to chancellery
    return teamAccount.chargeToChancellery(team.uuid, gameplay.internal.gameId, info.amount, info.infoText, function (err) {
      var entry = new chancelleryTransaction.Model();
      entry.gameId = gameplay.internal.gameId;
      entry.transaction = {
        origin: {
          uuid: team.uuid
        },
        amount: Math.abs(info.amount),
        info: info.infoText
      };

      chancelleryTransaction.book(entry, function (err) {
        return callback(err);
      });
    })
  }

}
// Play chancellery, a random amount is won or lost. This can also be the jackpot
function playChancellery(gameplay, team, callback) {
  var min = gameplay.gameParams.chancellery.minLottery || 1000;
  var max = gameplay.gameParams.chancellery.maxLottery || 5000;
  var retVal = {};
  retVal.amount = Math.floor((Math.random() * (max - min + 1) + min) / 1000) * 1000;
  retVal.infoText = 'Chance/Kanzlei: ';

  var actionRand = Math.random();
  if (actionRand < 0.1) {
    retVal.infoText = 'Parkplatzgewinn';
    retVal.jackpot = true;
    chancelleryTransaction.getEntries(gameplay.internal.gameId, null, null, function (err, entries) {
      retVal.amount = 0;
      for (var i = 0; i < entries.length; i++) {
        retVal.amount += entries[i].transaction.amount;
      }
      bookChancelleryEvent(gameplay, team, retVal, function (err) {
        return callback(err, retVal);
      });
    });
  }
  else {
    if (actionRand < 0.55) {
      retVal.amount *= (-1);
      retVal.infoText += ' Verlust';
    }
    else {
      retVal.infoText += 'Gewinn';
    }
    bookChancelleryEvent(gameplay, team, retVal, function (err) {
      return callback(err, retVal);
    })
  }
}

// Gambling: the team sets a value and wins it or looses it. Winning it is taken from bank,
// loosing it goes to the chancellery
function gamble(gameplay, team, amount, callback) {

}

// get the size of the jackpot
function getJackpotSize(gameplay, callback) {

}


/**
 * Gets the balance, at a given time or now
 * @param gameId
 * @param p1 timestamp until when the balance shall be gotten (optional, default: now)
 * @param p2 callback
 */
function getBalance(gameId, p1, p2) {
  var callback = p2;
  var ts = p1;
  if (_.isFunction(p1)) {
    callback = p1;
    ts = moment();
  }

  chancelleryTransaction.getEntries(gameId, undefined, ts, function (err, data) {
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


module.exports = {
  playChancellery: playChancellery,
  getBalance: getBalance
};
