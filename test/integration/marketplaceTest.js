/**
 * Marketplace integration test
 *
 * THIS TEST REQUIRES THE FERROPOLY-EDITOR PROJECT BEING ON ITS DESIGNATED PLACE
 *
 * Created by kc on 25.04.15.
 */
'use strict';
var expect = require('expect.js');
var db = require('./../../common/lib/ferropolyDb');
var marketplace = require('../../main/lib/accounting/marketplace');
var settings = require('./../../main/settings');

var gameId;

describe('Marketplace integration tests', function() {
  before(function(done) {
    require('../fixtures/demoGamePlay').createDemo({}, function(err, res) {
        gameId = res.gameId;
        db.init(settings, function (err) {
          done(err);
        });
      }
    )
  });

  it('should do something', function(done) {
    marketplace.payInterests(gameId, function(err) {
      done(err);
    })
  })
});
