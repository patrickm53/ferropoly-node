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
var logger = require('../../common/lib/logger').getLogger('gameCache');

var moment = require('moment');
var _ = require('lodash');

var gameCache = {};

module.exports = {
  getGameData: function (gameId, callback) {
    if (gameCache[gameId]) {
      return callback(null, gameCache[gameId]);
    }
    // not in cache
    gpModel.getGameplay(gameId, null, function (err, gp) {
      logger.info('GP Query for ' + gameId);
      if (err) {
        return callback(err);
      }

      var result = {gameplay: gp};

      teamModel.getTeams(gameId, function (err, teams) {
        if (err) {
          return callback(err);
        }
        // Add all teams to the result
        result.teams = {};
        for (var i = 0; i < teams.length; i++) {
          result.teams[teams[i].uuid] = teams[i];
        }

        // check if we have to add it to cache or not
        if (moment().isBetween(gp.scheduling.gameStartTs, gp.scheduling.gameEndTs)) {
          logger.info('GP added to cache');
          gameCache[gameId] = result;
        }

        return callback(null, result);
      });
    });
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
    logger.info('Refreshing gameCache');
    gpModel.getAllGameplays(function (err, gameplays) {

      gameCache = {};

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
          gameCache[gameplays[i].internal.gameId] = {gp: gameplays[i], teams: {}};
          gameplaysInCache++;
        }
      }
      var gpHandled = 0;
      var teamError = null;
      _.forOwn(gameCache, function (gp) {
        logger.info('GP value:', gp);
        if (!gp.internal) {
          logger.error('gp.internal not defined', gp);
          return;
        }
        teamModel.getTeams(gp.internal.gameId, function (err, teams) {
          if (err) {
            teamError = err;
          }
          if (teams && teams.length > 0) {
            for (var t = 0; t < teams.length; t++) {
              gameCache[gp.internal.gameId].teams[teams[t].uuid] = teams[t];
            }
          }
          gpHandled++;
          if (gpHandled === gameplaysInCache) {
            return callback(teamError);
          }
        });
      });
    });
  }
};
