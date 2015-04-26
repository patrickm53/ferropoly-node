/**
 * Marketplace integration test
 *
 * THIS TEST REQUIRES THE FERROPOLY-EDITOR PROJECT BEING ON ITS DESIGNATED PLACE
 *
 * Created by kc on 25.04.15.
 */
'use strict';
var expect = require('expect.js');
var _ = require('lodash');

var db = require('./../../common/lib/ferropolyDb');
var pricelistLib = require('./../../common/lib/pricelist');
var gameCache = require('../../main/lib/gameCache');
var marketplace = require('../../main/lib/accounting/marketplace');
var teamAccount = require('../../main/lib/accounting/teamAccount');
var settings = require('./../../main/settings');

var gameId;
var gameData;
var pricelist;

describe('Marketplace integration tests', function () {
  this.timeout(5000);
  before(function (done) {
    require('../fixtures/demoGamePlay').createDemo({}, function (err, res) {
        gameId = res.gameId;
        db.init(settings, function (err) {
          gameCache.getGameData(gameId, function (err, gd) {
            gameData = {
              gameplay: gd.gameplay,
              teams: _.values(gd.teams)
            };
            pricelistLib.getPricelist(gameId, function(err, list) {
              pricelist = list;
              done(err);
            });
          });
        });
      }
    )
  });

  describe('Paying interest', function () {
    it('should pay once', function (done) {
      marketplace.payInterests(gameId, function (err) {
        expect(err).to.be(null);
        teamAccount.getBalance(gameId, gameData.teams[0].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.gameplay.gameParams.interest);
          expect(info.entries).to.be(1);
          done(err);
        });
      });
    });

    it('should pay twice', function (done) {
      marketplace.payInterests(gameId, function (err) {
        expect(err).to.be(null);
        teamAccount.getBalance(gameId, gameData.teams[4].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.gameplay.gameParams.interest * 2);
          expect(info.entries).to.be(2);
          done(err);
        });
      });
    });

    it('should pay a third time', function (done) {
      marketplace.payInterests(gameId, function (err) {
        expect(err).to.be(null);
        teamAccount.getBalance(gameId, gameData.teams[5].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.gameplay.gameParams.interest * 3);
          expect(info.entries).to.be(3);
          done(err);
        });
      });
    });

    it('should pay a fourth time', function (done) {
      marketplace.payInterests(gameId, function (err) {
        expect(err).to.be(null);
        teamAccount.getBalance(gameId, gameData.teams[7].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.gameplay.gameParams.interest * 4);
          expect(info.entries).to.be(4);

          teamAccount.getAccountStatement(gameId, gameData.teams[3].uuid, function(err, data) {
            expect(data.length).to.be(4);
            expect(data[3].transaction.amount).to.be(gameData.gameplay.gameParams.interest);
          });
          done(err);
        });
      });
    });
  });

  describe('Building houses #1', function() {
    it('should do nothing as there are no houses', function(done) {
      marketplace.buildHouses(gameId, gameData.teams[0].uuid, function(err, info) {
        expect(info.amount).to.be(0);
        expect(info.log.length).to.be(0);
        done(err);
      })
    });
  });

  describe('Buying some properties', function() {
    it('should buy the cheapest place for team 0', function(done) {
      marketplace.buyProperty(gameId, gameData.teams[0].uuid, pricelist[0].uuid, function(err, info) {
        console.log(err);
        console.log(info);
        done(err);
      })
    })
  });

});
