/**
 * Cache for teams
 *
 * Teams are cached only, if their game is running
 * Created by kc on 21.04.15.
 */
'use strict';

var teamModel = require('../../common/models/teamModel');
var gpCache = require('./gameplayCache');

var teamCache = [];


module.exports = {
  getTeam: function (gameId, teamId, callback) {
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
  },

  getTeamSync: function(gameId, teamId) {
    if (teamCache[gameId][teamId]) {
      return teamCache[gameId][teamId];
    }
    return getTeam(gameId, teamId, function(err, team) {
      if (err) {
        return null;
      }
      return team;
    })
  }


};
