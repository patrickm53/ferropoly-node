/**
 * Caching game relevant things: gameplay and teams
 *
 * Only data of the current date is hold in the cache, refreshing the cache using
 * a cron job should be considered.
 *
 * Created by kc on 22.04.15.
 */


const teamModel = require('../../common/models/teamModel');
const gpModel   = require('../../common/models/gameplayModel');
const logger    = require('../../common/lib/logger').getLogger('gameCache');
const moment    = require('moment');
const _         = require('lodash');

let gameCache = {};

module.exports = {
  getGameData: function (gameId, callback) {
    if (gameCache[gameId]) {
      if (!gameCache[gameId].gameplay || !gameCache[gameId].teams) {
        logger.info('Missing important info in gameplay with id', gameId);
        return callback(new Error('cached game corrupt: ' + gameId));
      }
      return callback(null, gameCache[gameId]);
    }
    // not in cache
    gpModel.getGameplay(gameId, null, function (err, gp) {
      logger.info('GP Query for ' + gameId);
      if (err) {
        logger.error('getGameData, getting gameplay failed', err);
        return callback(err);
      }

      let result = {gameplay: gp};

      teamModel.getTeams(gameId, function (err, teams) {
        if (err) {
          logger.error('getGameData, getting teams failed', err);
          return callback(err);
        }
        // Add all teams to the result
        result.teams = {};
        for (var i = 0; i < teams.length; i++) {
          delete teams[i]._id;
          delete teams[i].gameId;
          delete teams[i].__v;
          result.teams[teams[i].uuid] = teams[i];
        }

        // check if we have to add it to cache or not
        if (moment().isBetween(gp.scheduling.gameStartTs, gp.scheduling.gameEndTs)) {
          logger.info('GP added to cache');
          gameCache[gameId] = result;
        }

        if (!result || !result.gameplay || !result.teams) {
          logger.info('Missing important info in gameplay with id', gameId);
          return callback(new Error('new game in cache is corrupt: ' + gameId));
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
      let gameplaysInCache = 0;
      logger.info('Gameplays found: ' + gameplays.length);
      for (let i = 0; i < gameplays.length; i++) {
        if (moment().isSame(moment(gameplays[i].scheduling.gameDate), 'day')) { // Todo: game is today!!
          logger.info('adding to cache: ' + gameplays[i].internal.gameId);
          gameCache[gameplays[i].internal.gameId] = {gameplay: gameplays[i], teams: {}};
          gameplaysInCache++;
        }
        else {
          logger.info('not added to cache: ' + gameplays[i].internal.gameId);
        }
      }

      if (gameplaysInCache === 0) {
        logger.info('No gameplays added to cache, it remains empty');
        return callback();
      }

      let gpHandled = 0;
      let teamError = null;
      _.forOwn(gameCache, function (cacheEntry) {
        let gp = cacheEntry.gameplay;
        // logger.info('GP value:', gp);
        if (!gp.internal) {
          logger.error('gp.internal not defined', gp);
          return;
        }
        teamModel.getTeams(gp.internal.gameId, function (err, teams) {
          if (err) {
            teamError = err;
          }
          if (teams && teams.length > 0) {
            for (let t = 0; t < teams.length; t++) {
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
