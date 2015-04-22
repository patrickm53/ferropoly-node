/**
 * Caching game relevant things: gameplay and teams
 *
 * Only data of the current date is hold in the cache, refreshing the cache using
 * a cron job should be considered.
 *
 * Created by kc on 22.04.15.
 */
'use strict';

var teamModel = require('../../common/models/teamModel');
var gpModel = require('../../common/models/gameplayModel');
var moment = require('moment');
var _ = require('lodash');
var gpCache = {};
var teamCache = {};

/**
 * Get the gameplays
 * @param gameId
 * @param callback
 * @returns gameplay
 */
function getGameplay(gameId, callback) {
  if (gpCache[gameId]) {
    callback(null, gpCache[gameId]);
    return null;
  }

  gpModel.getGameplay(gameId, null, function (err, gp) {
    console.log('GP Query for ' + gameId);
    if (err) {
      callback(err);
      return null;
    }

    if (gp) {
      if (moment().isBetween(gp.scheduling.gameStartTs, gp.scheduling.gameEndTs)) {
        console.log('GP added to cache');
        gpCache[gameId] = gp;
      }
    }
    callback(null, gp);
    return gp;
  })
}
/**
 * Get the data of a team, always reading from DB
 * @param gameId
 * @param teamId
 * @param callback
 */
function getTeam(gameId, teamId, callback) {
  teamModel.getTeams(gameId, function (err, teams) {
    if (err) {
      callback(err);
      return;
    }
    // Add all teams to the cache
    teamCache[gameId] = [];
    for (var i = 0; i < teams.length; i++) {
      teamCache[gameId][teams[i].uuid] = teams[i];
    }
    if (!teamCache[gameId][teamId]) {
      callback(new Error('Team not found'));
      return;
    }
    callback(null, teamCache[gameId][teamId]);
  });
}

module.exports = {
  /**
   * Synch call for getting a gameplay. Is only slow for the first time OR when a game is not today
   * @param gameId
   * @returns {*}
   */
  getGameplaySync: function (gameId) {
    if (gpCache[gameId]) {
      return gpCache[gameId];
    }
    var result = null;
    getGameplay(gameId, function (err, gp) {
      result = {
        err: err,
        gp: gp
      }
    });

    // Make it synchronous without blocking it all
    while (result === null) {
      process.tick();
    }
    return result.gp;

  },

  /**
   * Synch version of getTeam
   * @param gameId
   * @param teamId
   * @returns {*}
   */
  getTeamSync: function (gameId, teamId) {
    if (teamCache[gameId]) {
      if (teamCache[gameId][teamId]) {
        return teamCache[gameId][teamId];
      }
    }
    var result = null;
    getTeam(gameId, teamId, function (err, team) {
      result = {
        err: err,
        team: team
      }
    });

    // Make it synchronous without blocking it all
    while (result === null) {
      process.tick();
    }
    return result.team;
  },

  /**
   * Refresh the cache: clear it and rebuild it. After calling this function, we can use
   * the synch versions: all current teams are in the cache while the other ones should
   * not be used (as their game can't be played).
   *
   * Add this job to a cron job
   * @param callback
   */
  refreshCache: function (callback) {
    console.log('Refreshing gameCache');
    gpModel.getAllGameplays(function (err, gameplays) {

      teamCache = {};
      gpCache = {};

      if (err) {
        callback(err);
        return;
      }
      if (!gameplays || gameplays.length === 0) {
        callback(null);
        return;
      }
      var gameplaysInCache = 0;
      for (var i = 0; i < gameplays.length; i++) {
        if (moment().isSame(gameplays[i].scheduling.gameDate, 'day')) { // Todo: game is today!!
          gpCache[gameplays[i].internal.gameId] = gameplays[i];
          gameplaysInCache++;
        }
      }
      var gpHandled = 0;
      var teamError = null;
      _.forOwn(gpCache, function (gp, key) {
        teamCache[gp.internal.gameId] = {};
        teamModel.getTeams(gp.internal.gameId, function (err, teams) {
          if (err) {
            teamError = err;
          }
          if (teams && teams.length > 0) {
            for (var t = 0; t < teams.length; t++) {
              teamCache[gp.internal.gameId][teams[t].uuid] = teams[t];
            }
          }
          gpHandled++;
          if (gpHandled === gameplaysInCache) {
            return callback(teamError);
          }
        })
      });
    })
  },
  /**
   * Get the cache: this is for statistics and testing purposes
   * @returns {{gameCache: {}, teamCache: {}}}
   */
  getCache: function () {
    return {
      gameCache: gpCache,
      teamCache: teamCache
    }
  }

};
