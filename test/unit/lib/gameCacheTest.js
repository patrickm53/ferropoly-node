/**
 * Tests for the gameCache
 * Created by kc on 22.04.15.
 */
'use strict';
var sandboxedModule = require('sandboxed-module');
var expect = require('expect.js');
var moment = require('moment');
var _ = require('lodash');


var gpModelState = 'empty';
var teamModelState = 'empty';

// Gameplays used, two are valid for today
var gp1 = {internal: {gameId: 'gp1'}, scheduling: {gameDate: moment().subtract(1, 'days')}};
var gp2 = {internal: {gameId: 'gp2'}, scheduling: {gameDate: new Date()}};
var gp3 = {internal: {gameId: 'gp3'}, scheduling: {gameDate: moment().add(1, 'days')}};
var gp4 = {internal: {gameId: 'gp4'}, scheduling: {gameDate: new Date()}};

/**
 * Create the teams for the gameplays
 * @param gpId
 * @param nb
 * @returns {Array}
 */
function setTeams(gpId, nb) {
  var retVal = [];
  for (var i = 0; i < nb; i++) {
    var team = {
      name: 'team ' + nb + ' (' + gpId + ')',
      gameId: gpId,
      uuid: gpId + '-' + i
    };
    retVal.push(team);
  }
  return retVal;
}


// Team Model sandbox
var teamModel = {
  teamData: {
    gp1: setTeams('gp1', 4),
    gp2: setTeams('gp2', 8),
    gp3: setTeams('gp3', 12),
    gp4: setTeams('gp4', 15)
  },

  getTeams: function (gameId, callback) {
    switch (teamModelState) {
      case 'full':
        return callback(null, this.teamData[gameId]);

      case 'error':
        return callback(new Error('Teams Testing Error'));

      default:
        return callback();
    }
  }
};

// Gameplay Model sandbox
var gpModel = {
  gps : {
    gp1: gp1,
    gp2: gp2,
    gp3: gp3,
    gp4: gp4
  },
  getAllGameplays: function (callback) {
    switch (gpModelState) {
      case 'full':
        return callback(null, [gp1, gp2, gp3, gp4]);

      case 'error':
        return callback(new Error('Gameplay Testing error'));

      default:
        return callback(null);

    }
  },

  getGameplay: function(gpId, opt, callback) {
    callback(null, this.gps[gpId]);
  }
};

var gameCache = sandboxedModule.require('../../../main/lib/gameCache', {
    requires: {
      '../../common/models/teamModel': teamModel,
      '../../common/models/gameplayModel': gpModel,
      'moment': moment,
      'lodash': _
    }
  }
);

/*
 Finally starting the tests
 */
describe('gameCache tests', function () {
  describe('exceptional tests', function () {

    describe('Empty collection test', function () {
      it('should work without doing anything', function (done) {
        gpModelState = 'empty';
        teamModelState = 'empty';
        gameCache.refreshCache(function (err) {
          done(err);
        });
      })
    });

    describe('Error in gameplay collection test', function () {
      it('should cause an error', function (done) {
        gpModelState = 'error';
        teamModelState = 'empty';
        gameCache.refreshCache(function (err) {
          expect(err).not.to.be(null);
          done();
        });
      })
    });

    describe('Real collection test', function () {
      it('should work even there are no teams', function (done) {
        gpModelState = 'full';
        teamModelState = 'empty';
        gameCache.refreshCache(function (err) {
          done(err);
        });
      })
    });

    describe('Real collection test with team error', function () {
      it('should abort', function (done) {
        gpModelState = 'full';
        teamModelState = 'error';
        gameCache.refreshCache(function (err) {
          expect(err).not.to.be(null);
          done();
        });
      })
    });
  });

  describe('Normal condition tests', function () {
    it('should cache the current teams', function (done) {
      gpModelState = 'full';
      teamModelState = 'full';
      gameCache.refreshCache(function (err) {
        var cache = gameCache.getCache();
        expect(cache.gameCache['gp1']).to.be(undefined);
        expect(cache.gameCache['gp2']).not.to.be(null);
        expect(cache.gameCache['gp3']).to.be(undefined);
        expect(cache.gameCache['gp4']).not.to.be(null);
        expect(cache.teamCache['gp1']).to.be(undefined);
        expect(cache.teamCache['gp2']['gp2-7']).not.to.be(undefined);
        expect(cache.teamCache['gp3']).to.be(undefined);
        expect(cache.teamCache['gp4']['gp4-14']).not.to.be(undefined);

        expect(cache.teamCache['gp2']['gp2-1']).to.be(gameCache.getTeamSync('gp2', 'gp2-1'));
        expect(cache.teamCache['gp2']['gp2-2']).to.be(gameCache.getTeamSync('gp2', 'gp2-2'));
        expect(cache.teamCache['gp2']['gp2-5']).to.be(gameCache.getTeamSync('gp2', 'gp2-5'));
        expect(cache.teamCache['gp2']['gp2-12']).to.be(undefined);

        expect(cache.teamCache['gp4']['gp4-1']).to.be(gameCache.getTeamSync('gp4', 'gp4-1'));
        expect(cache.teamCache['gp4']['gp4-2']).to.be(gameCache.getTeamSync('gp4', 'gp4-2'));
        expect(cache.teamCache['gp4']['gp4-5']).to.be(gameCache.getTeamSync('gp4', 'gp4-5'));
        expect(cache.teamCache['gp4']['gp4-22']).to.be(undefined);

        done(err);
      })
    });

    it('should not read the teams not in the cache', function (done) {
      gpModelState = 'full';
      teamModelState = 'full';
      gameCache.refreshCache(function (err) {
        expect(gameCache.getGameplaySync('gp1').internal.gameId).to.be('gp1');
        expect(gameCache.getGameplaySync('gp3').internal.gameId).to.be('gp3');
        expect(gameCache.getGameplaySync('gp7')).to.be(undefined);
        expect(gameCache.getTeamSync('gp3', 'gp3-4').uuid).to.be('gp3-4');
        expect(gameCache.getTeamSync('gp1', 'gp1-3').uuid).to.be('gp1-3');
        expect(gameCache.getTeamSync('gp1', 'gp1-8')).to.be(undefined);
        done(err);
      });
    });

    it('should return all teams of a gameplay', function(done) {
      gpModelState = 'full';
      teamModelState = 'full';
      gameCache.refreshCache(function (err) {
        expect(gameCache.getTeamsSync('gp1').length).to.be(4);
        expect(gameCache.getTeamsSync('gp2').length).to.be(8);
        expect(gameCache.getTeamsSync('gp3').length).to.be(12);
        expect(gameCache.getTeamsSync('gp4').length).to.be(15);
        done(err);
      });
    });

  });
})
;
