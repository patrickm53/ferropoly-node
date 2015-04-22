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

var gpCache = [];
var teamCache = [];
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

    if (moment().isBetween(gp.scheduling.gameStartTs, gp.scheduling.gameEndTs)) {
      console.log('GP added to cache');
      gpCache[gameId] = gp;
    }
    callback(null, gp);
    return gp;
  })
}
/**
 * Get the data of a team
 * @param gameId
 * @param teamId
 * @param callback
 */
function getTeam (gameId, teamId, callback) {
  if (teamCache[gameId][teamId]) {
    callback(null, teamCache[gameId][teamId]);
    return;
  }

  var gp = gpCache.getGameplaySync();
  if (!gp) {
    callback(new Error('GP load error'));
    return;
  }

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
    return getGameplay(gameId, function (err, gp) {
      return gp;
    })
  },

  /**
   * Synch version of getTeam
   * @param gameId
   * @param teamId
   * @returns {*}
   */
  getTeamSync: function (gameId, teamId) {
    if (teamCache[gameId][teamId]) {
      return teamCache[gameId][teamId];
    }
    return getTeam(gameId, teamId, function (err, team) {
      if (err) {
        return null;
      }
      return team;
    })
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
    gpModel.getAllGameplays(function (err, gameplays) {
      teamCache = [];
      gpCache = [];

      if (err) {
        callback(err);
        return;
      }
      for (var i = 0; i < gameplays.length; i++) {
        if (gameplays[i].scheduling.gameDate) { // Todo: game is today!!
          gpCache[gameplays[i].internal.gameId] = gameplays[i];
        }
      }
      var gpHandled = 0;
      for (i = 0; i < gpCache.length; i++) {
        teamModel.getTeams(gpCache[i].internal.gameId, function (err, teams) {
          if (teams) {
            for (var t = 0; t < teams.length; t++) {
              teamCache[gpCache[i].internal.gameId][teams[t].uuid] = teams[t];
            }
          }
          gpHandled++;
          if (gpHandled === gpCache.length) {
            callback();
          }
        })
      }
    })
  }

};
