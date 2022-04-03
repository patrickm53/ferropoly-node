/**
 * This module handles the access to gameplays over routes: it verifies whether the
 * user has access a specific gameplay or not and if so, which rights are granted
 *
 * Created by kc on 10.07.15.
 */

const gamecache  = require('./gameCache');
const gameplays  = require('../../common/models/gameplayModel');
const _          = require('lodash');
const logger     = require('../../common/lib/logger').getLogger('lib:accessor');

const PLAYER = 1;
const ADMIN  = 2;

/**
 * Checks if admins rights are granted (as owner or as assigned admin)
 * @param email
 * @param gameplay
 * @returns {*}
 */
function userHasAdminRights(email, gameplay) {
  if (gameplay.internal.owner === email) {
    return true;
  }
  if (gameplay.admins && gameplay.admins.logins) {
    return _.find(gameplay.admins.logins, function (n) {
      return n === email;
    });
  }
  return false;
}

module.exports = {

  player: PLAYER,
  admin : ADMIN,
  /**
   * Checks the rights: has a user the required minimal rights level?
   *
   * This function is only for admins, it does not fit for teams.
   *
   * If no rights are given, an error is issued
   *
   * @param userId
   * @param gameId
   * @param minLevel minimal level required for accessing the page
   * @param callback
   */

  verify: function (userId, gameId, minLevel, callback) {
    gamecache.getGameData(gameId, function (err, gc) {
      if (err) {
        return callback(err);
      }

      if (!gc) {
        // either the gameId does not exist or it needs to be refreshed. Try to get it directly
        gameplays.getGameplay(gameId, userId, function (err, gp) {
          if (err) {
            return callback(err);
          }
          if (!gp) {
            return callback(new Error('no such gameplay'));
          }
          // The gameplay is here, refresh cache
          gamecache.refreshCache(function () {
            if (userHasAdminRights(userId, gc.gameplay)) {
              return callback(null, {hasAdminRights: true});
            }
            logger.debug('No access rights granted for ' + userId);
            return callback(new Error('No access rights granted'));
          });
        });
      } else if (userHasAdminRights(userId, gc.gameplay)) {
        // it's the admin and the game is in the cache, return always ok
        return callback(null, {hasAdminRights: true});
      }

      // If the game is over, the game data gets public
      if (_.get(gc, 'gameplay.internal.gameDataPublic', false)) {
        return callback(null, {userHasAdminRights: false});
      }

      // Todo: handle player rights for future features
      logger.debug('No access rights granted for ' + userId);
      return callback(new Error('No access rights granted'));
    });
  },

  verifyPlayer: function (userId, gameId, teamId, callback) {
    gamecache.getGameData(gameId, function (err, gc) {
      if (err) {
        return callback(err);
      }

      let team = gc.teams[teamId];
      if (!team) {
        return callback(new Error('Unknown teamId, not allowed'));
      }

      if (team.data.teamLeader.email === userId) {
        return callback();
      }

      if (_.find(team.data.members, function (m) {
        return m === userId;
      })) {
        return callback();
      }

      if (userHasAdminRights(userId, gc.gameplay)) {
        // Admin is also ok
        return callback();
      }

      logger.debug('No user access rights granted for ' + userId);
      return callback(new Error('No access rights granted'));
    });
  }
};
