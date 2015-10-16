/**
 * Tests the property groups feature of the marketplace
 *
 * THIS TEST REQUIRES THE FERROPOLY-EDITOR PROJECT BEING ON ITS DESIGNATED PLACE
 *
 * Created by kc on 28.04.15.
 */
'use strict';

var expect = require('expect.js');
var _ = require('lodash');

var db = require('./../../common/lib/ferropolyDb');
var pricelistLib = require('./../../common/lib/pricelist');
var gameCache = require('../../main/lib/gameCache');
var marketplace = require('../../main/lib/accounting/marketplace').createMarketplace(null);
var teamAccount = require('../../main/lib/accounting/teamAccount');
var settings = require('./../../main/settings');

var gameId;
var gameData;
var pricelist;

describe('Marketplace propertyGroup tests', function () {
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

            for (var i = 0; i < gameData.teams.length; i++) {
              gameData.teams[i].expectedMoney = 0;
            }
            pricelistLib.getPricelist(gameId, function (err, list) {
              pricelist = list;
              done(err);
            });
          });
        });
      }
    )
  });

  after(function (done) {
    db.close(function (err) {
      done(err);
    })
  });

  describe('Buying first property', function () {
    it('should buy the first property of a group', function (done) {
      var teamIndex = 1;
      var propertyIndex = 16;
      var propertyPrice = 2000;
      gameData.teams[teamIndex].expectedMoney -= propertyPrice;
      gameData.teams[teamIndex].expectedEntries = 1;

      marketplace.buyProperty({
        gameId: gameId,
        teamId: gameData.teams[teamIndex].uuid,
        propertyId: pricelist[propertyIndex].uuid
      }, function (err, info) {
        expect(err).to.be(null);
        expect(info.property.gameId).to.be(gameId);
        expect(info.property.pricelist.price).to.be(propertyPrice);
        expect(info.amount).to.be(propertyPrice);

        teamAccount.getBalance(gameId, gameData.teams[teamIndex].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.teams[teamIndex].expectedMoney);
          expect(info.entries).to.be(gameData.teams[teamIndex].expectedEntries);

          teamAccount.getAccountStatement(gameId, gameData.teams[teamIndex].uuid, function (err, data) {
            expect(data.length).to.be(gameData.teams[teamIndex].expectedEntries);
            expect(data[gameData.teams[teamIndex].expectedEntries - 1].transaction.amount).to.be(propertyPrice * (-1));
            done(err);
          });
        });
      })
    });

  });

  describe('Pay rent & interest, allow building houses', function () {
    it('should pay the rent #1', function (done) {
      var teamIndex = 1;
      var expectedRent = 250;
      var expectedIncome = expectedRent + gameData.gameplay.gameParams.interest;

      if (gameData.teams[teamIndex].expectedMoney < 0) {
        gameData.teams[teamIndex].expectedMoney -= Math.abs(gameData.teams[teamIndex].expectedMoney * .2);
        gameData.teams[teamIndex].expectedEntries++;
      }

      marketplace.payRents({gameId: gameId}, function (err) {

        gameData.teams[teamIndex].expectedMoney += expectedIncome;
        gameData.teams[teamIndex].expectedEntries += 2;

        teamAccount.getBalance(gameId, gameData.teams[teamIndex].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.teams[teamIndex].expectedMoney);
          expect(info.entries).to.be(gameData.teams[teamIndex].expectedEntries);

          teamAccount.getAccountStatement(gameId, gameData.teams[teamIndex].uuid, function (err, data) {
            expect(data.length).to.be(gameData.teams[teamIndex].expectedEntries);
            console.log(data);
            var lastEntry = _.last(data);
            expect(lastEntry.transaction.parts.length).to.be(1);
            expect(lastEntry.transaction.parts[0].propertyName.length).to.be.above(1);
            expect(lastEntry.transaction.parts[0].property.length).to.be.above(16);
            expect(lastEntry.transaction.parts[0].amount).to.be.above(0);
            expect(lastEntry.transaction.amount).to.be(expectedRent);
            done(err);
          });
        });
      })
    });
  });
  describe('Buy second one', function () {
    it('should buy the second property of a group', function (done) {
      var teamIndex = 1;
      var propertyIndex = 17;
      var propertyPrice = 2000;
      gameData.teams[teamIndex].expectedMoney -= propertyPrice;
      gameData.teams[teamIndex].expectedEntries++;

      marketplace.buyProperty({
        gameId: gameId,
        teamId: gameData.teams[teamIndex].uuid,
        propertyId: pricelist[propertyIndex].uuid
      }, function (err, info) {
        expect(err).to.be(null);
        expect(info.property.gameId).to.be(gameId);
        expect(info.property.pricelist.price).to.be(propertyPrice);
        expect(info.amount).to.be(propertyPrice);

        teamAccount.getBalance(gameId, gameData.teams[teamIndex].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.teams[teamIndex].expectedMoney);
          expect(info.entries).to.be(gameData.teams[teamIndex].expectedEntries);

          teamAccount.getAccountStatement(gameId, gameData.teams[teamIndex].uuid, function (err, data) {
            expect(data.length).to.be(gameData.teams[teamIndex].expectedEntries);
            expect(data[gameData.teams[teamIndex].expectedEntries - 1].transaction.amount).to.be(propertyPrice * (-1));
            done(err);
          });
        });
      })
    });
  });

  describe('Building first house', function () {
    it('should build one house for the first property', function (done) {
      var teamIndex = 1;
      var buildingNbExpected = 1;
      var buildingCostsExpected = -1000;
      gameData.teams[teamIndex].expectedMoney += buildingCostsExpected;
      gameData.teams[teamIndex].expectedEntries++;

      marketplace.buildHouses(gameId, gameData.teams[teamIndex].uuid, function (err, info) {
        console.log(info);
        expect(info.amount).to.be(buildingCostsExpected);
        expect(info.log.length).to.be(1);

        var i = 0;
        expect(info.log[i].amount).to.be(-1000);
        expect(info.log[i].buildingNb).to.be(buildingNbExpected);
        expect(info.log[i].property).to.be(pricelist[16].uuid);
        expect(info.log[i].propertyName).to.be(pricelist[16].location.name);
        done(err);
      });
    });
  });

  describe('Pay rent & interest, allow building houses', function () {
    it('should pay the rent #1', function (done) {
      var teamIndex = 1;
      var expectedRent = (1000 * 2) + (250 * 2);
      var expectedIncome = expectedRent + gameData.gameplay.gameParams.interest;

      if (gameData.teams[teamIndex].expectedMoney < 0) {
        gameData.teams[teamIndex].expectedMoney -= Math.abs(gameData.teams[teamIndex].expectedMoney * .2);
        gameData.teams[teamIndex].expectedEntries++;
      }

      marketplace.payRents({gameId: gameId}, function (err) {
        gameData.teams[teamIndex].expectedMoney += expectedIncome;
        gameData.teams[teamIndex].expectedEntries += 2;

        teamAccount.getBalance(gameId, gameData.teams[teamIndex].uuid, function (err, info) {
          expect(info.balance).to.be(gameData.teams[teamIndex].expectedMoney);
          expect(info.entries).to.be(gameData.teams[teamIndex].expectedEntries);

          teamAccount.getAccountStatement(gameId, gameData.teams[teamIndex].uuid, function (err, data) {
            expect(data.length).to.be(gameData.teams[teamIndex].expectedEntries);
            console.log(data);
            var lastEntry = _.last(data);
            expect(lastEntry.transaction.parts.length).to.be(2);
            expect(lastEntry.transaction.parts[0].propertyName.length).to.be.above(1);
            expect(lastEntry.transaction.parts[0].property.length).to.be.above(16);
            expect(lastEntry.transaction.parts[0].amount).to.be.above(0);
            expect(lastEntry.transaction.amount).to.be(expectedRent);
            done(err);
          });
        });
      })
    });
  });
});
