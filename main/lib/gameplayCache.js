/**
 * Prevents loading a gameplay from the DB everytime it is needed. Gameplays are only cached if the date
 * of the game is today
 *
 * Created by kc on 21.04.15.
 */
'use strict';

var gameplays = require('../../common/models/gameplayModel');

var gpCache = [];


module.exports = {
  /**
   * Get the gameplays
   * @param gameId
   * @param callback
   * @returns gameplay
   */
  getGameplay: function (gameId, callback) {
    if (gpCache[gameId]) {
      callback(null, gpCache[gameId]);
      return null;
    }

    gameplays.getGameplay(gameId, null, function (err, gp) {
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
  },

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
  }

};
