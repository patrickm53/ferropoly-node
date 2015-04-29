/**
 *
 * Created by kc on 29.04.15.
 */
'use strict';


var expect = require('expect.js');
var _ = require('lodash');

var db = require('./../../common/lib/ferropolyDb');
var gameCache = require('../../main/lib/gameCache');
var marketplace = require('../../main/lib/accounting/marketplace');
var teamAccount = require('../../main/lib/accounting/teamAccount');
var chancelleryAccount = require('../../main/lib/accounting/chancelleryAccount');

var settings = require('./../../main/settings');

var gameId;
var gameData;
var chancellery = {};

function handleLotteryResult(teamIndex, info) {
  console.log(info);
  gameData.teams[teamIndex].expectedMoney += info.amount;
  if (info.jackpot) {
    chancellery.expectedMoney -= info.amount;
  }
  else if (info.amount < 0) {
    chancellery.expectedMoney += Math.abs(info.amount);
  }
  console.log(chancellery);
}

describe.only('Chancellery tests', function () {
  this.timeout(5000);
  before(function (done) {
    require('../fixtures/demoGamePlay').createDemo({}, function (err, res) {
      gameId = res.gameId;
      db.init(settings, function (err) {
        gameCache.getGameData(gameId, function (err, gd) {
          if (err) {
            console.error(err);
            done(err);
          }
          gameData = {
            gameplay: gd.gameplay,
            teams: _.values(gd.teams)
          };
          chancellery.expectedMoney = 0;

          for (var i = 0; i < gameData.teams.length; i++) {
            gameData.teams[i].expectedMoney = 0;
          }
          done();
        });
      });
    });
  });

  describe('Playing the lottery', function () {
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        console.log(chancellery);
        done(err);
      })
    });


  });
});
