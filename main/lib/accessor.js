/**
 * This module handles the access to gameplays over routes: it verifies whether the
 * user has access a specific gameplay or not and if so, which rights are granted
 *
 * Created by kc on 10.07.15.
 */
'use strict';
var gamecache = require('./gameCache');

var PLAYER = 1;
var ADMIN = 2;
/**
 * Returns the rights, either:
 * 'ADMIN' if this is the owner of the game (or in future: a delegated user)
 * 'PLAYER' if this a player accessing
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

      if (gc.gameplay.owner.organisatorEmail === userId) {
        // it's the admin, return always ok
        return callback(null);
      }
      logger.debug('No access rights granted for ' + userId);
      return callback(new Error('No access rights granted'));
    })
  }
};
