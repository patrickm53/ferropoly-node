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
var gameCache = require('../../main/lib/gameCache');
var marketplace = require('../../main/lib/accounting/marketplace');
var teamAccount = require('../../main/lib/accounting/models/teamAccountTransaction');
var settings = require('./../../main/settings');

var gameId;
var gameData;

describe('Marketplace integration tests', function() {
  this.timeout(5000);
  before(function(done) {
    require('../fixtures/demoGamePlay').createDemo({}, function(err, res) {
        gameId = res.gameId;
        db.init(settings, function (err) {
          gameCache.getGameData(gameId, function(err, gd) {
            gameData = {
              gameplay: gd.gameplay,
              teams: _.values(gd.teams)
            };
            done(err);
          });
        });
      }
    )
  });

  it('should do something', function(done) {
    marketplace.payInterests(gameId, function(err) {
      teamAccount.getEntries(gameId, gameData.teams[0].uuid, undefined, undefined, function(err, data) {
        console.log(data);
        done(err);
      });

    })
  })
});
