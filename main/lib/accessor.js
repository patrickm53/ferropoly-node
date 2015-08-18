/**
 * This module handles the access to gameplays over routes: it verifies whether the
 * user has access a specific gameplay or not and if so, which rights are granted
 *
 * Created by kc on 10.07.15.
 */
'use strict';
var gamecache = require('./gameCache');
var gameplays = require('../../common/models/gameplayModel');

var PLAYER = 1;
var ADMIN = 2;
/**
 * Checks the rights: has a user the required minimal rights level?
 *
 * If no rights are given, an error is issued
 *
 * @param userId
 * @param gameId
 * @param minLevel minimal level required for accessing the page
 * @param callback
 */
var logger = require('../../common/lib/logger').getLogger('lib:accessor');

module.exports = {

  player: PLAYER,
  admin: ADMIN,

  verify: function (userId, gameId, minLevel, callback) {
    gamecache.getGameData(gameId, function (err, gc) {
      if (err) {
        return callback(err);
      }

      if (!gc) {
        // either the gameId does not exist or it needs to be refreshed. Try to get it directly
        gameplays.getGameplay(gameId, userId, function(err, gp) {
          if (err) {
            return callback(err);
          }
          if (!gp) {
            return callback(new Error('no such gameplay'));
          }
          // The gameplay is here, refresh cache
          gamecache.refreshCache(function() {
            if (gp.owner.organisatorEmail === userId) {
              return callback(null);
            }
            logger.debug('No access rights granted for ' + userId);
            return callback(new Error('No access rights granted'));
          });
        });
      } else if (gc.gameplay.owner.organisatorEmail === userId) {
        // it's the admin and the game is in the cache, return always ok
        return callback(null);
      }
      // Todo: handle player rights for future features
      logger.debug('No access rights granted for ' + userId);
      return callback(new Error('No access rights granted'));
    })
  }
};
