/**
 * Sandbox test for the marketplace
 *
 * This seems to be a quite silly action: each test requires a lot of mocking. We'll test this module with
 * an integration test, this module will disappear
 *
 * Created by kc on 23.04.15.
 */
'use strict';
var sandboxedModule = require('sandboxed-module');
var expect = require('expect.js');
var moment = require('moment');
var _ = require('lodash');

var result;

var teams = [{uuid: 'team1'}, {uuid: 'team2'}, {uuid: 'team3'}, {uuid: 'team4'}];
/**
 * The simulated gameCache
 * @type {{}}
 */
var gameCache = {
  getGameplaySync: function (gameId) {
    return {
      gameParams: {
        interest: 4000
      }
    }
  },
  getTeamsSync: function (gameId) {
    return teams;
  }
};
/**
 * The simulated teamAccount
 * @type {{}}
 */
var teamAccount = {
  payInterest: function (teamId, gameId, amount, callback) {
    result.push( {
      teamId: teamId,
      gameId: gameId,
      amount: amount
    });
    callback();
  },
  chargeToBank: function(callback) {
    callback();
  }
};
var propertyWrapper = {

};
var propertyAccount = {
  getProperty: function(propertyId, gameId, callback) {
    callback('r');
  }
};
var marketplace = sandboxedModule.require('../../../main/lib/accounting/marketplace', {
    requires: {
      '../gameCache': gameCache,
      './teamAccount': teamAccount,
      '../propertyWrapper': propertyWrapper,
      './propertyAccount': propertyAccount
    }
  }
);

describe('marketplace tests', function () {
  beforeEach(function(){
    result = [];
  });

  describe('interest tests', function () {
    describe('pay interest for only one team', function () {
      it('should pay the interest', function (done) {
        marketplace.payInterest('gp1', 'team1', function () {
          expect(result.length).to.be(1);
          expect(result[0].teamId).to.be('team1');
          expect(result[0].gameId).to.be('gp1');
          expect(result[0].amount).to.be(4000);
          done();
        });
      });
    });

    describe('pay interest for all teams', function () {
      it('should pay for all teams', function (done) {
        marketplace.payInterests('gp2', function () {
          expect(result.length).to.be(4);
          for (var i = 0; i < result.length; i++) {
            expect(result[i].amount).to.be(4000);
            expect(result[i].gameId).to.be('gp2');
            expect(result[i].teamId).to.be(teams[i].uuid);
          }
          done();
        });
      });
    });
  });
});
